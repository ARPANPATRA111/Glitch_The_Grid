'use server';

import { revalidatePath } from 'next/cache';
import { getAdminFirestore, getAdminAuth } from '@/lib/firebase/admin';
import { getSession } from './auth';
import { FieldValue } from 'firebase-admin/firestore';
import type { 
  PlacementDrive, 
  Application, 
  UserProfile,
  Company,
  DriveStatus,
  ApplicationStatus,
  PlacementTier,
  UserRole
} from '@/types/schema';

export interface AdminStats {
  activeDrives: number;
  totalStudents: number;
  pendingApplications: number;
  placements: number;
}

export async function getAdminStats(): Promise<{ success: boolean; stats?: AdminStats; error?: string }> {
  try {
    await verifyAdminAccess();
    const db = getAdminFirestore();

    const activeDrivesSnap = await db.collection('drives')
      .where('status', 'in', ['open', 'in-progress', 'upcoming'])
      .get();

    const studentsSnap = await db.collection('users')
      .where('role', '==', 'student')
      .get();

    const pendingAppsSnap = await db.collection('applications')
      .where('status', 'in', ['applied', 'shortlisted'])
      .get();

    let placementsCount = 0;
    studentsSnap.docs.forEach(doc => {
      const data = doc.data();
      if (data.placementStatus?.isPlaced) {
        placementsCount++;
      }
    });

    return {
      success: true,
      stats: {
        activeDrives: activeDrivesSnap.size,
        totalStudents: studentsSnap.size,
        pendingApplications: pendingAppsSnap.size,
        placements: placementsCount,
      }
    };
  } catch (error) {
    console.error('Get admin stats failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to get stats' };
  }
}

async function verifyAdminAccess() {
  const session = await getSession();
  if (!session) {
    throw new Error('Not authenticated');
  }
  if (session.role !== 'admin' && session.role !== 'tpo') {
    throw new Error('Unauthorized: Admin or TPO access required');
  }
  return session;
}

async function verifyAdminOnlyAccess() {
  const session = await getSession();
  if (!session) {
    throw new Error('Not authenticated');
  }
  if (session.role !== 'admin') {
    throw new Error('Unauthorized: Admin access required');
  }
  return session;
}

function serializeFirestoreData<T>(data: T): T {
  if (data === null || data === undefined) return data;
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

export interface CreateDriveInput {
  companyName: string;
  companyLogo?: string;
  industry: string;
  website?: string;
  jobTitle: string;
  jobDescription: string;
  jobType: 'full-time' | 'internship' | 'ppo';
  workLocation: string;
  isRemote: boolean;
  tier: PlacementTier;
  packageLPA: number;
  stipendPerMonth?: number;
  eligibility: {
    minCGPA: number;
    maxBacklogs?: number;
    allowedPrograms: string[];
    allowedBatches?: string[];
    minTenthPercent?: number;
    minTwelfthPercent?: number;
  };
  applicationDeadline: string;
  driveDate?: string;
  status: DriveStatus;
}

export async function createDrive(input: CreateDriveInput) {
  try {
    const session = await verifyAdminAccess();
    const db = getAdminFirestore();

    const driveRef = db.collection('drives').doc();
    const drive: PlacementDrive = {
      id: driveRef.id,
      companyId: driveRef.id, 
      companyName: input.companyName,
      companyLogo: input.companyLogo ?? '',
      industry: input.industry ?? '',
      website: input.website ?? '',
      jobTitle: input.jobTitle,
      jobDescription: input.jobDescription ?? '',
      jobType: input.jobType,
      workLocation: input.workLocation ?? '',
      isRemote: input.isRemote ?? false,
      tier: input.tier,
      packageLPA: input.packageLPA,
      stipendPerMonth: input.stipendPerMonth ?? 0,
      eligibility: input.eligibility,
      rounds: [],
      applicationDeadline: new Date(input.applicationDeadline),
      driveDate: input.driveDate ? new Date(input.driveDate) : undefined,
      status: input.status,
      applicantCount: 0,
      shortlistedCount: 0,
      selectedCount: 0,
      documents: [],
      createdBy: session.uid,
      createdAt: new Date(),
      updatedAt: new Date(),
      publishedAt: input.status === 'open' ? new Date() : undefined,
    };

    await driveRef.set(drive);
    revalidatePath('/admin/drives');
    revalidatePath('/drives');

    return { success: true, driveId: driveRef.id };
  } catch (error) {
    console.error('Create drive failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to create drive' };
  }
}

export async function updateDrive(driveId: string, updates: Partial<CreateDriveInput>) {
  try {
    await verifyAdminAccess();
    const db = getAdminFirestore();

    const updateData: Record<string, unknown> = { ...updates, updatedAt: new Date() };
    
    if (updates.applicationDeadline) {
      updateData.applicationDeadline = new Date(updates.applicationDeadline);
    }
    if (updates.driveDate) {
      updateData.driveDate = new Date(updates.driveDate);
    }

    await db.collection('drives').doc(driveId).update(updateData);
    revalidatePath('/admin/drives');
    revalidatePath('/drives');
    revalidatePath(`/drives/${driveId}`);

    return { success: true };
  } catch (error) {
    console.error('Update drive failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to update drive' };
  }
}

export async function deleteDrive(driveId: string) {
  try {
    await verifyAdminAccess();
    const db = getAdminFirestore();

    const applicationsSnap = await db.collection('applications')
      .where('driveId', '==', driveId)
      .limit(1)
      .get();

    if (!applicationsSnap.empty) {
      return { 
        success: false, 
        error: 'Cannot delete drive with existing applications. Cancel it instead.' 
      };
    }

    await db.collection('drives').doc(driveId).delete();
    revalidatePath('/admin/drives');
    revalidatePath('/drives');

    return { success: true };
  } catch (error) {
    console.error('Delete drive failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to delete drive' };
  }
}

export async function updateDriveStatus(driveId: string, status: DriveStatus) {
  try {
    await verifyAdminAccess();
    const db = getAdminFirestore();

    const updates: Record<string, unknown> = { 
      status, 
      updatedAt: new Date() 
    };

    if (status === 'open') {
      updates.publishedAt = new Date();
    }

    await db.collection('drives').doc(driveId).update(updates);
    revalidatePath('/admin/drives');
    revalidatePath('/drives');
    revalidatePath(`/drives/${driveId}`);

    return { success: true };
  } catch (error) {
    console.error('Update drive status failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to update status' };
  }
}

export async function getAllDrives() {
  try {
    await verifyAdminAccess();
    const db = getAdminFirestore();

    const drivesSnap = await db.collection('drives')
      .orderBy('createdAt', 'desc')
      .get();

    const drives = drivesSnap.docs.map(doc => 
      serializeFirestoreData({ id: doc.id, ...doc.data() }) as PlacementDrive
    );

    return { success: true, drives };
  } catch (error) {
    console.error('Get all drives failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to get drives', drives: [] };
  }
}

export async function getDriveById(driveId: string) {
  try {
    await verifyAdminAccess();
    const db = getAdminFirestore();

    const driveDoc = await db.collection('drives').doc(driveId).get();
    
    if (!driveDoc.exists) {
      return { success: false, error: 'Drive not found' };
    }

    const drive = serializeFirestoreData({ id: driveDoc.id, ...driveDoc.data() }) as PlacementDrive;
    return { success: true, drive };
  } catch (error) {
    console.error('Get drive failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to get drive' };
  }
}

export async function getAllStudents(filters?: {
  program?: string;
  batch?: string;
  placementStatus?: 'placed' | 'unplaced';
}) {
  try {
    await verifyAdminAccess();
    const db = getAdminFirestore();

    let query = db.collection('users').where('role', '==', 'student');

    if (filters?.program) {
      query = query.where('programCode', '==', filters.program);
    }
    if (filters?.batch) {
      query = query.where('batch', '==', filters.batch);
    }

    const studentsSnap = await query.limit(500).get();

    let students = studentsSnap.docs.map(doc => {
      const data = doc.data();
      return serializeFirestoreData({ ...data, id: doc.id }) as unknown as UserProfile;
    });

    students.sort((a, b) => (a.fullName ?? '').localeCompare(b.fullName ?? ''));

    if (filters?.placementStatus) {
      students = students.filter(s => 
        filters.placementStatus === 'placed' 
          ? s.placementStatus.isPlaced 
          : !s.placementStatus.isPlaced
      );
    }

    return { success: true, students };
  } catch (error) {
    console.error('Get all students failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to get students', students: [] };
  }
}

export async function getStudentById(studentId: string) {
  try {
    await verifyAdminAccess();
    const db = getAdminFirestore();

    const studentDoc = await db.collection('users').doc(studentId).get();
    
    if (!studentDoc.exists) {
      return { success: false, error: 'Student not found' };
    }

    const student = serializeFirestoreData({ ...studentDoc.data(), id: studentDoc.id }) as unknown as UserProfile;
    return { success: true, student };
  } catch (error) {
    console.error('Get student failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to get student' };
  }
}

export async function updateStudentStatus(
  studentId: string, 
  updates: {
    isDebarred?: boolean;
    debarmentReason?: string;
  }
) {
  try {
    await verifyAdminAccess();
    const db = getAdminFirestore();

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (updates.isDebarred !== undefined) {
      updateData['placementStatus.isDebarred'] = updates.isDebarred;
      if (updates.isDebarred) {
        updateData['placementStatus.debarmentDate'] = new Date();
        updateData['placementStatus.debarmentReason'] = updates.debarmentReason || 'Debarred by admin';
      }
    }

    await db.collection('users').doc(studentId).update(updateData);
    revalidatePath('/admin/students');

    return { success: true };
  } catch (error) {
    console.error('Update student status failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to update student' };
  }
}

export async function getAllApplications(filters?: {
  driveId?: string;
  status?: ApplicationStatus;
  studentId?: string;
}) {
  try {
    await verifyAdminAccess();
    const db = getAdminFirestore();

    let query = db.collection('applications').orderBy('appliedAt', 'desc');

    const applicationsSnap = await query.get();

    let applications = applicationsSnap.docs.map(doc => 
      serializeFirestoreData({ id: doc.id, ...doc.data() }) as Application
    );

    if (filters?.driveId) {
      applications = applications.filter(a => a.driveId === filters.driveId);
    }
    if (filters?.status) {
      applications = applications.filter(a => a.status === filters.status);
    }
    if (filters?.studentId) {
      applications = applications.filter(a => a.studentId === filters.studentId);
    }

    return { success: true, applications };
  } catch (error) {
    console.error('Get all applications failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to get applications', applications: [] };
  }
}

export async function updateApplicationStatus(
  applicationId: string,
  status: ApplicationStatus,
  additionalData?: {
    offerPackageLPA?: number;
    feedback?: string;
    autoMarkPlaced?: boolean;
  }
) {
  try {
    await verifyAdminAccess();
    const db = getAdminFirestore();

    const updates: Record<string, unknown> = {
      status,
      updatedAt: new Date(),
    };

    if (additionalData?.offerPackageLPA) {
      updates.offerPackageLPA = additionalData.offerPackageLPA;
    }

    const applicationDoc = await db.collection('applications').doc(applicationId).get();
    const application = applicationDoc.data() as Application;

    await db.runTransaction(async (transaction) => {
      const appRef = db.collection('applications').doc(applicationId);
      const driveRef = db.collection('drives').doc(application.driveId);

      transaction.update(appRef, updates);

      if (status === 'shortlisted' && application.status === 'applied') {
        transaction.update(driveRef, {
          shortlistedCount: FieldValue.increment(1),
          updatedAt: new Date(),
        });
      } else if (status === 'selected') {
        transaction.update(driveRef, {
          selectedCount: FieldValue.increment(1),
          updatedAt: new Date(),
        });

        if (additionalData?.autoMarkPlaced) {
          const studentRef = db.collection('users').doc(application.studentId);
          const studentDoc = await transaction.get(studentRef);
          const studentData = studentDoc.data();
          
          const driveDoc = await transaction.get(driveRef);
          const driveData = driveDoc.data() as PlacementDrive;

          const currentOffers = studentData?.placementStatus?.offers ?? [];
          const newOffer = {
            driveId: application.driveId,
            companyId: driveData?.companyId ?? '',
            companyName: application.companyName,
            tier: application.tier,
            packageLPA: additionalData.offerPackageLPA ?? application.packageLPA,
            offerDate: new Date(),
            acceptedAt: new Date(),
          };

          transaction.update(studentRef, {
            'placementStatus.isPlaced': true,
            'placementStatus.currentTier': application.tier,
            'placementStatus.offers': [...currentOffers, newOffer],
            updatedAt: new Date(),
          });

          transaction.update(appRef, {
            offerAccepted: true,
            offerAcceptedAt: new Date(),
          });
        }
      }
    });

    revalidatePath('/admin/applications');
    revalidatePath('/admin/students');
    revalidatePath(`/admin/drives/${application.driveId}`);

    return { success: true };
  } catch (error) {
    console.error('Update application status failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to update application' };
  }
}

export async function markStudentAsPlaced(
  studentId: string,
  placementData: {
    companyName: string;
    packageLPA: number;
    tier: PlacementTier;
    offerDate?: Date;
    driveId?: string;
    companyId?: string;
  }
) {
  try {
    await verifyAdminAccess();
    const db = getAdminFirestore();

    const studentRef = db.collection('users').doc(studentId);
    const studentDoc = await studentRef.get();

    if (!studentDoc.exists) {
      return { success: false, error: 'Student not found' };
    }

    const studentData = studentDoc.data();
    const currentOffers = studentData?.placementStatus?.offers ?? [];

    const newOffer = {
      driveId: placementData.driveId ?? '',
      companyId: placementData.companyId ?? '',
      companyName: placementData.companyName,
      tier: placementData.tier,
      packageLPA: placementData.packageLPA,
      offerDate: placementData.offerDate ?? new Date(),
      acceptedAt: new Date(),
    };

    await studentRef.update({
      'placementStatus.isPlaced': true,
      'placementStatus.currentTier': placementData.tier,
      'placementStatus.offers': [...currentOffers, newOffer],
      updatedAt: new Date(),
    });

    revalidatePath('/admin/students');
    revalidatePath(`/admin/students/${studentId}`);

    return { success: true };
  } catch (error) {
    console.error('Mark student as placed failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to mark student as placed' };
  }
}

export async function markApplicationAsPlaced(applicationId: string) {
  try {
    await verifyAdminAccess();
    const db = getAdminFirestore();

    const applicationDoc = await db.collection('applications').doc(applicationId).get();
    if (!applicationDoc.exists) {
      return { success: false, error: 'Application not found' };
    }
    const application = applicationDoc.data() as Application;

    const driveDoc = await db.collection('drives').doc(application.driveId).get();
    const driveData = driveDoc.exists ? driveDoc.data() as PlacementDrive : null;

    const studentRef = db.collection('users').doc(application.studentId);
    const studentDoc = await studentRef.get();
    if (!studentDoc.exists) {
      return { success: false, error: 'Student not found' };
    }
    const studentData = studentDoc.data();

    const currentOffers = studentData?.placementStatus?.offers ?? [];
    const newOffer = {
      driveId: application.driveId,
      companyId: driveData?.companyId ?? '',
      companyName: application.companyName,
      tier: application.tier,
      packageLPA: application.packageLPA,
      offerDate: new Date(),
      acceptedAt: new Date(),
    };

    const batch = db.batch();

    batch.update(applicationDoc.ref, {
      status: 'selected',
      offerAccepted: true,
      offerAcceptedAt: new Date(),
      updatedAt: new Date(),
    });

    batch.update(studentRef, {
      'placementStatus.isPlaced': true,
      'placementStatus.currentTier': application.tier,
      'placementStatus.offers': [...currentOffers, newOffer],
      updatedAt: new Date(),
    });

    if (driveDoc.exists) {
      batch.update(driveDoc.ref, {
        selectedCount: FieldValue.increment(1),
        updatedAt: new Date(),
      });
    }

    await batch.commit();

    revalidatePath('/admin/applications');
    revalidatePath('/admin/students');
    revalidatePath('/admin/analytics');
    revalidatePath(`/admin/students/${application.studentId}`);
    revalidatePath(`/admin/drives/${application.driveId}`);

    return { success: true };
  } catch (error) {
    console.error('Mark application as placed failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to mark as placed' };
  }
}

export async function bulkUpdateApplicationStatus(
  applicationIds: string[],
  status: ApplicationStatus
) {
  try {
    await verifyAdminAccess();
    const db = getAdminFirestore();
    const batch = db.batch();

    for (const appId of applicationIds) {
      const appRef = db.collection('applications').doc(appId);
      batch.update(appRef, { status, updatedAt: new Date() });
    }

    await batch.commit();
    revalidatePath('/admin/applications');

    return { success: true, count: applicationIds.length };
  } catch (error) {
    console.error('Bulk update failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to bulk update' };
  }
}

export async function getAllCompanies() {
  try {
    await verifyAdminAccess();
    const db = getAdminFirestore();

    const companiesSnap = await db.collection('companies')
      .limit(200)
      .get();

    const companies = companiesSnap.docs.map(doc => 
      serializeFirestoreData({ id: doc.id, ...doc.data() }) as Company
    );

    companies.sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));

    return { success: true, companies };
  } catch (error) {
    console.error('Get all companies failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to get companies', companies: [] };
  }
}

export async function createCompany(input: {
  name: string;
  logo?: string;
  website?: string;
  industry: string;
  description?: string;
  headquarters?: string;
  hrContacts?: { name: string; email: string; phone?: string; designation?: string }[];
}) {
  try {
    await verifyAdminAccess();
    const db = getAdminFirestore();

    const companyRef = db.collection('companies').doc();
    const company: Company = {
      id: companyRef.id,
      name: input.name,
      logo: input.logo ?? '',
      website: input.website ?? '',
      industry: input.industry,
      description: input.description ?? '',
      headquarters: input.headquarters ?? '',
      totalDrives: 0,
      totalHires: 0,
      averagePackageLPA: 0,
      hrContacts: input.hrContacts || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await companyRef.set(company);
    revalidatePath('/admin/companies');

    return { success: true, companyId: companyRef.id };
  } catch (error) {
    console.error('Create company failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to create company' };
  }
}

export async function updateCompany(companyId: string, updates: Partial<Company>) {
  try {
    await verifyAdminAccess();
    const db = getAdminFirestore();

    await db.collection('companies').doc(companyId).update({
      ...updates,
      updatedAt: new Date(),
    });

    revalidatePath('/admin/companies');
    return { success: true };
  } catch (error) {
    console.error('Update company failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to update company' };
  }
}

export async function deleteCompany(companyId: string) {
  try {
    await verifyAdminAccess();
    const db = getAdminFirestore();

    const drivesSnap = await db.collection('drives')
      .where('companyId', '==', companyId)
      .limit(1)
      .get();

    if (!drivesSnap.empty) {
      return { success: false, error: 'Cannot delete company with existing drives' };
    }

    await db.collection('companies').doc(companyId).delete();
    revalidatePath('/admin/companies');

    return { success: true };
  } catch (error) {
    console.error('Delete company failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to delete company' };
  }
}

export async function getAnalytics() {
  try {
    await verifyAdminAccess();
    const db = getAdminFirestore();

    const [drivesSnap, studentsSnap, applicationsSnap] = await Promise.all([
      db.collection('drives').get(),
      db.collection('users').where('role', '==', 'student').get(),
      db.collection('applications').get(),
    ]);

    const drives = drivesSnap.docs.map(d => d.data() as PlacementDrive);
    const students = studentsSnap.docs.map(d => d.data() as UserProfile);
    const applications = applicationsSnap.docs.map(d => d.data() as Application);

    const totalStudents = students.length;
    const placedStudents = students.filter(s => s.placementStatus.isPlaced).length;
    const placementRate = totalStudents > 0 ? ((placedStudents / totalStudents) * 100).toFixed(1) : '0';

    const activeDrives = drives.filter(d => d.status === 'open' || d.status === 'in-progress').length;
    const completedDrives = drives.filter(d => d.status === 'completed').length;

    const totalApplications = applications.length;
    const pendingApplications = applications.filter(a => a.status === 'applied').length;
    const selectedApplications = applications.filter(a => a.status === 'selected').length;

    const placedOffers = students.flatMap(s => s.placementStatus.offers || []);
    const avgPackage = placedOffers.length > 0
      ? (placedOffers.reduce((sum, o) => sum + o.packageLPA, 0) / placedOffers.length).toFixed(2)
      : '0';

    const highestPackage = placedOffers.length > 0
      ? Math.max(...placedOffers.map(o => o.packageLPA))
      : 0;

    const programStats = students.reduce((acc, s) => {
      const code = s.programCode ?? 'unknown';
      if (!acc[code]) {
        acc[code] = { total: 0, placed: 0, program: s.programName ?? 'Unknown' };
      }
      acc[code].total++;
      if (s.placementStatus?.isPlaced) {
        acc[code].placed++;
      }
      return acc;
    }, {} as Record<string, { total: number; placed: number; program: string }>);

    const tierStats = drives.reduce((acc, d) => {
      const tier = d.tier ?? 'regular';
      if (!acc[tier]) {
        acc[tier] = { drives: 0, applications: 0, selected: 0 };
      }
      acc[tier].drives++;
      acc[tier].applications += d.applicantCount ?? 0;
      acc[tier].selected += d.selectedCount ?? 0;
      return acc;
    }, {} as Record<string, { drives: number; applications: number; selected: number }>);

    return {
      success: true,
      analytics: {
        overview: {
          totalStudents,
          placedStudents,
          placementRate: `${placementRate}%`,
          activeDrives,
          completedDrives,
          totalDrives: drives.length,
          totalApplications,
          pendingApplications,
          selectedApplications,
          avgPackage: `${avgPackage} LPA`,
          highestPackage: `${highestPackage} LPA`,
        },
        programStats: Object.entries(programStats).map(([code, stats]) => ({
          code,
          ...stats,
          rate: stats.total > 0 ? `${((stats.placed / stats.total) * 100).toFixed(1)}%` : '0%',
        })),
        tierStats: Object.entries(tierStats).map(([tier, stats]) => ({
          tier,
          ...stats,
        })),
      },
    };
  } catch (error) {
    console.error('Get analytics failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to get analytics' };
  }
}

export async function getAllUsers() {
  try {
    await verifyAdminOnlyAccess();
    const db = getAdminFirestore();

    const usersSnap = await db.collection('users')
      .orderBy('createdAt', 'desc')
      .get();

    const users = usersSnap.docs.map(doc => {
      const data = doc.data();
      return serializeFirestoreData({ ...data, id: doc.id }) as unknown as UserProfile;
    });

    return { success: true, users };
  } catch (error) {
    console.error('Get all users failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to get users', users: [] };
  }
}

export async function updateUserRole(userId: string, role: UserRole) {
  try {
    await verifyAdminOnlyAccess();
    const db = getAdminFirestore();
    const auth = getAdminAuth();

    await db.collection('users').doc(userId).update({
      role,
      updatedAt: new Date(),
    });

    await auth.setCustomUserClaims(userId, { role });

    await auth.revokeRefreshTokens(userId);

    revalidatePath('/admin/users');

    return { success: true };
  } catch (error) {
    console.error('Update user role failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to update user role' };
  }
}

export async function createAdminUser(input: {
  email: string;
  password: string;
  fullName: string;
  role: 'admin' | 'tpo';
}) {
  try {
    await verifyAdminOnlyAccess();
    const db = getAdminFirestore();
    const auth = getAdminAuth();

    const userRecord = await auth.createUser({
      email: input.email,
      password: input.password,
      displayName: input.fullName,
      emailVerified: true,
    });

    await auth.setCustomUserClaims(userRecord.uid, { role: input.role });

    const userProfile: Partial<UserProfile> = {
      uid: userRecord.uid,
      email: input.email,
      emailVerified: true,
      fullName: input.fullName,
      role: input.role,
      isProfileComplete: true,
      profileCompletionPercent: 100,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection('users').doc(userRecord.uid).set(userProfile);
    revalidatePath('/admin/users');

    return { success: true, userId: userRecord.uid };
  } catch (error) {
    console.error('Create admin user failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to create user' };
  }
}

export async function deleteUser(userId: string) {
  try {
    const session = await verifyAdminOnlyAccess();
    
    if (userId === session.uid) {
      return { success: false, error: 'Cannot delete your own account' };
    }

    const db = getAdminFirestore();
    const auth = getAdminAuth();

    await db.collection('users').doc(userId).delete();

    await auth.deleteUser(userId);

    revalidatePath('/admin/users');

    return { success: true };
  } catch (error) {
    console.error('Delete user failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to delete user' };
  }
}
