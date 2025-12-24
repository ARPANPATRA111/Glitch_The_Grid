'use server';

import { revalidatePath } from 'next/cache';
import { getAdminFirestore } from '@/lib/firebase/admin';
import { getSession } from './auth';
import { 
  checkEligibility, 
  DEFAULT_ELIGIBILITY_CONFIG 
} from '@/lib/iips/eligibility-engine';
import type { 
  UserProfile, 
  PlacementDrive, 
  Application, 
  ApplicationStatus,
  EligibilityConfig 
} from '@/types/schema';
import { FieldValue } from 'firebase-admin/firestore';

function serializeFirestoreData<T>(data: T): T {
  if (data === null || data === undefined) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(item => serializeFirestoreData(item)) as T;
  }

  if (typeof data === 'object') {
    if ('toDate' in data && typeof (data as { toDate: () => Date }).toDate === 'function') {
      return (data as { toDate: () => Date }).toDate().toISOString() as T;
    }

    if (data instanceof Date) {
      return data.toISOString() as T;
    }

    const serialized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      serialized[key] = serializeFirestoreData(value);
    }
    return serialized as T;
  }

  return data;
}

export interface PlacementActionResult {
  success: boolean;
  error?: string;
  data?: unknown;
}

class PlacementError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'PlacementError';
  }
}

function generateApplicationId(driveId: string, studentId: string): string {
  return `${driveId}_${studentId}`;
}

export async function applyToDrive(driveId: string): Promise<PlacementActionResult> {
  try {
    const session = await getSession();
    if (!session) {
      throw new PlacementError('You must be logged in to apply', 'UNAUTHENTICATED');
    }
    
    if (session.role !== 'student') {
      throw new PlacementError('Only students can apply to drives', 'FORBIDDEN');
    }

    const db = getAdminFirestore();
    const studentId = session.uid;
    const applicationId = generateApplicationId(driveId, studentId);

    await db.runTransaction(async (transaction) => {
      const studentRef = db.collection('users').doc(studentId);
      const driveRef = db.collection('drives').doc(driveId);
      const applicationRef = db.collection('applications').doc(applicationId);
      const configRef = db.collection('config').doc('eligibility');

      const [studentSnap, driveSnap, applicationSnap, configSnap] = await Promise.all([
        transaction.get(studentRef),
        transaction.get(driveRef),
        transaction.get(applicationRef),
        transaction.get(configRef),
      ]);

      if (!studentSnap.exists) {
        throw new PlacementError(
          'Your profile was not found. Please complete your profile first.',
          'PROFILE_NOT_FOUND'
        );
      }

      if (!driveSnap.exists) {
        throw new PlacementError(
          'This placement drive does not exist or has been removed.',
          'DRIVE_NOT_FOUND'
        );
      }

      if (applicationSnap.exists) {
        throw new PlacementError(
          'You have already applied to this drive.',
          'ALREADY_APPLIED'
        );
      }

      const student = studentSnap.data() as UserProfile;
      const drive = driveSnap.data() as PlacementDrive;
      const config = configSnap.exists 
        ? (configSnap.data() as EligibilityConfig)
        : DEFAULT_ELIGIBILITY_CONFIG;

      if (!student.isProfileComplete) {
        throw new PlacementError(
          'Please complete your profile before applying to drives.',
          'PROFILE_INCOMPLETE'
        );
      }

      if (!student.resumeUrl) {
        throw new PlacementError(
          'Please upload your resume before applying to drives.',
          'RESUME_REQUIRED'
        );
      }

      const eligibilityResult = checkEligibility(student, drive, config);

      if (!eligibilityResult.eligible) {
        throw new PlacementError(
          eligibilityResult.reason,
          'INELIGIBLE',
          {
            state: eligibilityResult.state,
            blockedBy: eligibilityResult.blockedBy,
            currentTier: eligibilityResult.currentTier,
            targetTier: eligibilityResult.targetTier,
          }
        );
      }

      const application: Application = {
        id: applicationId,
        driveId,
        studentId,
        
        studentName: student.fullName,
        studentRollNumber: student.rollNumber,
        studentEmail: student.email,
        studentCGPA: student.cgpa,
        studentProgram: student.programCode,
        
        companyName: drive.companyName,
        packageLPA: drive.packageLPA,
        tier: drive.tier,
        
        status: 'applied',
        roundResults: [],
        
        resumeUrl: student.resumeUrl,
        
        appliedAt: new Date(),
        updatedAt: new Date(),
      };

      transaction.set(applicationRef, application);
      
      transaction.update(driveRef, {
        applicantCount: FieldValue.increment(1),
        updatedAt: new Date(),
      });

      transaction.update(studentRef, {
        appliedDrives: FieldValue.arrayUnion(driveId),
        updatedAt: new Date(),
      });
    });

    revalidatePath('/dashboard');
    revalidatePath('/drives');
    revalidatePath(`/drives/${driveId}`);

    return {
      success: true,
      data: { applicationId },
    };
  } catch (error) {
    console.error('Apply to drive failed:', error);

    if (error instanceof PlacementError) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    };
  }
}

export async function withdrawApplication(driveId: string): Promise<PlacementActionResult> {
  try {
    const session = await getSession();
    if (!session) {
      throw new PlacementError('You must be logged in', 'UNAUTHENTICATED');
    }

    const db = getAdminFirestore();
    const studentId = session.uid;
    const applicationId = generateApplicationId(driveId, studentId);

    await db.runTransaction(async (transaction) => {
      const applicationRef = db.collection('applications').doc(applicationId);
      const driveRef = db.collection('drives').doc(driveId);
      const studentRef = db.collection('users').doc(studentId);

      const applicationSnap = await transaction.get(applicationRef);

      if (!applicationSnap.exists) {
        throw new PlacementError('Application not found', 'NOT_FOUND');
      }

      const application = applicationSnap.data() as Application;

      if (application.status === 'selected' || application.status === 'rejected') {
        throw new PlacementError(
          `Cannot withdraw an application that is already ${application.status}`,
          'INVALID_STATE'
        );
      }

      transaction.update(applicationRef, {
        status: 'withdrawn' as ApplicationStatus,
        withdrawnAt: new Date(),
        updatedAt: new Date(),
      });

      transaction.update(driveRef, {
        applicantCount: FieldValue.increment(-1),
        updatedAt: new Date(),
      });

      transaction.update(studentRef, {
        appliedDrives: FieldValue.arrayRemove(driveId),
        updatedAt: new Date(),
      });
    });

    revalidatePath('/dashboard');
    revalidatePath('/drives');
    revalidatePath(`/drives/${driveId}`);

    return { success: true };
  } catch (error) {
    console.error('Withdraw application failed:', error);

    if (error instanceof PlacementError) {
      return { success: false, error: error.message };
    }

    return { success: false, error: 'Failed to withdraw application' };
  }
}

export async function acceptOffer(driveId: string): Promise<PlacementActionResult> {
  try {
    const session = await getSession();
    if (!session) {
      throw new PlacementError('You must be logged in', 'UNAUTHENTICATED');
    }

    const db = getAdminFirestore();
    const studentId = session.uid;
    const applicationId = generateApplicationId(driveId, studentId);

    await db.runTransaction(async (transaction) => {
      const applicationRef = db.collection('applications').doc(applicationId);
      const driveRef = db.collection('drives').doc(driveId);
      const studentRef = db.collection('users').doc(studentId);

      const [applicationSnap, driveSnap, studentSnap] = await Promise.all([
        transaction.get(applicationRef),
        transaction.get(driveRef),
        transaction.get(studentRef),
      ]);

      if (!applicationSnap.exists || !driveSnap.exists || !studentSnap.exists) {
        throw new PlacementError('Required documents not found', 'NOT_FOUND');
      }

      const application = applicationSnap.data() as Application;
      const drive = driveSnap.data() as PlacementDrive;
      const student = studentSnap.data() as UserProfile;

      if (application.status !== 'selected') {
        throw new PlacementError(
          'You can only accept offers for selections',
          'INVALID_STATE'
        );
      }

      const newOffer = {
        driveId,
        companyId: drive.companyId,
        companyName: drive.companyName,
        tier: drive.tier,
        packageLPA: application.offerPackageLPA ?? drive.packageLPA,
        offerDate: new Date(),
        acceptedAt: new Date(),
        offerLetterUrl: application.offerLetterUrl,
      };

      const currentOffers = student.placementStatus.offers ?? [];
      
      transaction.update(studentRef, {
        'placementStatus.isPlaced': true,
        'placementStatus.currentTier': drive.tier,
        'placementStatus.offers': [...currentOffers, newOffer],
        updatedAt: new Date(),
      });

      transaction.update(applicationRef, {
        offerAccepted: true,
        offerAcceptedAt: new Date(),
        updatedAt: new Date(),
      });

      transaction.update(driveRef, {
        selectedCount: FieldValue.increment(1),
        updatedAt: new Date(),
      });
    });

    revalidatePath('/dashboard');
    revalidatePath('/offers');

    return { success: true };
  } catch (error) {
    console.error('Accept offer failed:', error);

    if (error instanceof PlacementError) {
      return { success: false, error: error.message };
    }

    return { success: false, error: 'Failed to accept offer' };
  }
}

export async function updateApplicationStatus(
  applicationId: string,
  status: ApplicationStatus,
  roundResult?: {
    roundId: string;
    roundName: string;
    status: 'passed' | 'failed' | 'absent';
    score?: number;
    feedback?: string;
  }
): Promise<PlacementActionResult> {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'tpo' && session.role !== 'admin')) {
      throw new PlacementError('Unauthorized', 'FORBIDDEN');
    }

    const db = getAdminFirestore();
    const applicationRef = db.collection('applications').doc(applicationId);

    const updates: Record<string, unknown> = {
      status,
      updatedAt: new Date(),
    };

    if (roundResult) {
      updates.roundResults = FieldValue.arrayUnion({
        ...roundResult,
        evaluatedAt: new Date(),
        evaluatedBy: session.uid,
      });
      updates.currentRound = roundResult.roundId;
    }

    await applicationRef.update(updates);

    const [driveId] = applicationId.split('_');
    if (driveId) {
      const driveRef = db.collection('drives').doc(driveId);
      
      if (status === 'shortlisted') {
        await driveRef.update({
          shortlistedCount: FieldValue.increment(1),
          updatedAt: new Date(),
        });
      }
    }

    revalidatePath('/admin/drives');
    revalidatePath('/admin/applications');

    return { success: true };
  } catch (error) {
    console.error('Update application status failed:', error);

    if (error instanceof PlacementError) {
      return { success: false, error: error.message };
    }

    return { success: false, error: 'Failed to update application' };
  }
}

export async function createDrive(
  driveData: Omit<PlacementDrive, 'id' | 'applicantCount' | 'shortlistedCount' | 'selectedCount' | 'createdAt' | 'updatedAt' | 'createdBy'>
): Promise<PlacementActionResult> {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'tpo' && session.role !== 'admin')) {
      throw new PlacementError('Unauthorized', 'FORBIDDEN');
    }

    const db = getAdminFirestore();
    const driveRef = db.collection('drives').doc();

    const drive: PlacementDrive = {
      ...driveData,
      id: driveRef.id,
      applicantCount: 0,
      shortlistedCount: 0,
      selectedCount: 0,
      createdBy: session.uid,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await driveRef.set(drive);

    revalidatePath('/admin/drives');
    revalidatePath('/drives');

    return {
      success: true,
      data: { driveId: drive.id },
    };
  } catch (error) {
    console.error('Create drive failed:', error);

    if (error instanceof PlacementError) {
      return { success: false, error: error.message };
    }

    return { success: false, error: 'Failed to create drive' };
  }
}

export async function updateDriveStatus(
  driveId: string,
  status: PlacementDrive['status']
): Promise<PlacementActionResult> {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'tpo' && session.role !== 'admin')) {
      throw new PlacementError('Unauthorized', 'FORBIDDEN');
    }

    const db = getAdminFirestore();
    const driveRef = db.collection('drives').doc(driveId);

    const updates: Record<string, unknown> = {
      status,
      updatedAt: new Date(),
    };

    if (status === 'open') {
      updates.publishedAt = new Date();
    }

    await driveRef.update(updates);

    revalidatePath('/admin/drives');
    revalidatePath('/drives');
    revalidatePath(`/drives/${driveId}`);

    return { success: true };
  } catch (error) {
    console.error('Update drive status failed:', error);

    if (error instanceof PlacementError) {
      return { success: false, error: error.message };
    }

    return { success: false, error: 'Failed to update drive' };
  }
}

export async function debarStudent(
  studentId: string,
  reason: string
): Promise<PlacementActionResult> {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      throw new PlacementError('Unauthorized - Admin only', 'FORBIDDEN');
    }

    const db = getAdminFirestore();
    const studentRef = db.collection('users').doc(studentId);

    await studentRef.update({
      'placementStatus.isDebarred': true,
      'placementStatus.debarmentReason': reason,
      'placementStatus.debarmentDate': new Date(),
      updatedAt: new Date(),
    });

    revalidatePath('/admin/students');

    return { success: true };
  } catch (error) {
    console.error('Debar student failed:', error);

    if (error instanceof PlacementError) {
      return { success: false, error: error.message };
    }

    return { success: false, error: 'Failed to debar student' };
  }
}

export async function getOpenDrives(): Promise<PlacementDrive[]> {
  try {
    const db = getAdminFirestore();
    
    const snapshot = await db
      .collection('drives')
      .where('status', 'in', ['open', 'upcoming'])
      .limit(50)
      .get();

    const drives = snapshot.docs.map((doc) => 
      serializeFirestoreData({
        ...doc.data(),
        id: doc.id,
      })
    ) as PlacementDrive[];

    return drives.sort((a, b) => {
      const dateA = new Date(a.applicationDeadline ?? Date.now());
      const dateB = new Date(b.applicationDeadline ?? Date.now());
      return dateA.getTime() - dateB.getTime();
    });
  } catch (error) {
    console.error('Error fetching open drives:', error);
    return [];
  }
}

export async function getMyApplications(): Promise<Application[]> {
  try {
    const session = await getSession();
    if (!session) return [];

    const db = getAdminFirestore();
    
    const snapshot = await db
      .collection('applications')
      .where('studentId', '==', session.uid)
      .limit(100)
      .get();

    const applications = snapshot.docs.map((doc) => 
      serializeFirestoreData({
        ...doc.data(),
        id: doc.id,
      })
    ) as Application[];

    return applications.sort((a, b) => {
      const dateA = new Date(a.appliedAt ?? Date.now());
      const dateB = new Date(b.appliedAt ?? Date.now());
      return dateB.getTime() - dateA.getTime();
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    return [];
  }
}

export async function getDriveById(driveId: string): Promise<PlacementDrive | null> {
  const db = getAdminFirestore();
  const doc = await db.collection('drives').doc(driveId).get();

  if (!doc.exists) return null;

  return serializeFirestoreData({
    ...doc.data(),
    id: doc.id,
  }) as PlacementDrive;
}
