'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { 
  createSessionCookie, 
  verifySessionCookie, 
  revokeUserSessions,
  getAdminFirestore,
  getAdminAuth,
  SESSION_COOKIE_NAME,
  SESSION_COOKIE_OPTIONS 
} from '@/lib/firebase/admin';
import { parseRollNumber } from '@/lib/iips/roll-parser';
import type { UserProfile, UserRole, PlacementStatus } from '@/types/schema';

export interface AuthActionResult {
  success: boolean;
  error?: string;
  redirectTo?: string;
}

export interface CreateSessionInput {
  idToken: string;
}

export interface CompleteProfileInput {
  rollNumber: string;
  phone: string;
  gender: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  dateOfBirth: string;
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
  };
  cgpa: number;
  activeBacklogs: number;
  tenthPercentage: number;
  tenthBoard: string;
  tenthYear: number;
  twelfthPercentage: number;
  twelfthBoard: string;
  twelfthYear: number;
}

export async function createSession(input: CreateSessionInput): Promise<AuthActionResult> {
  try {
    const { idToken } = input;

    const auth = getAdminAuth();
    const decodedToken = await auth.verifyIdToken(idToken);

    const sessionCookie = await createSessionCookie(idToken);

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, sessionCookie, {
      ...SESSION_COOKIE_OPTIONS,
      expires: new Date(Date.now() + SESSION_COOKIE_OPTIONS.maxAge),
    });

    const db = getAdminFirestore();
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();

    if (!userDoc.exists) {
      return {
        success: true,
        redirectTo: '/onboarding',
      };
    }

    const userData = userDoc.data() as UserProfile;

    if (!userData.isProfileComplete) {
      return {
        success: true,
        redirectTo: '/onboarding',
      };
    }

    return {
      success: true,
      redirectTo: userData.role === 'student' ? '/dashboard' : '/admin',
    };
  } catch (error) {
    console.error('Session creation failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create session',
    };
  }
}

export async function getSession() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionCookie) {
      return null;
    }

    const claims = await verifySessionCookie(sessionCookie);
    
    if (claims) {
      if (!claims.role) {
        const db = getAdminFirestore();
        const userDoc = await db.collection('users').doc(claims.uid).get();
        if (userDoc.exists) {
          const userData = userDoc.data() as UserProfile;
          return {
            ...claims,
            role: userData.role,
            programCode: userData.programCode,
          };
        }
      }
    }
    
    return claims;
  } catch (error) {
    console.error('Session verification failed:', error);
    return null;
  }
}

export async function destroySession(): Promise<AuthActionResult> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (sessionCookie) {
      const claims = await verifySessionCookie(sessionCookie);
      if (claims) {
        await revokeUserSessions(claims.uid);
      }
    }

    cookieStore.delete(SESSION_COOKIE_NAME);

    return {
      success: true,
      redirectTo: '/login',
    };
  } catch (error) {
    console.error('Session destruction failed:', error);
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);

    return {
      success: true,
      redirectTo: '/login',
    };
  }
}

export async function logout() {
  await destroySession();
  redirect('/login');
}

export async function completeProfile(input: CompleteProfileInput): Promise<AuthActionResult> {
  try {
    const session = await getSession();
    if (!session) {
      return {
        success: false,
        error: 'Not authenticated',
      };
    }

    const rollResult = parseRollNumber(input.rollNumber);
    if (!rollResult.success) {
      return {
        success: false,
        error: rollResult.error.message,
      };
    }

    const rollData = rollResult.data;

    // Check if roll number is already registered by another user
    const db = getAdminFirestore();
    const existingUserQuery = await db.collection('users')
      .where('rollNumber', '==', rollData.rollNumber)
      .limit(1)
      .get();

    if (!existingUserQuery.empty) {
      const existingUser = existingUserQuery.docs[0];
      // Make sure it's not the same user re-completing their profile
      if (existingUser.id !== session.uid) {
        return {
          success: false,
          error: `Roll number ${rollData.rollNumber} is already registered. Each student can only have one account.`,
        };
      }
    }

    // Get the user's display name from Firebase Auth (set during signup)
    const auth = getAdminAuth();
    const firebaseUser = await auth.getUser(session.uid);
    const fullName = firebaseUser.displayName || session.email?.split('@')[0] || 'Student';

    const placementStatus: PlacementStatus = {
      isPlaced: false,
      currentTier: null,
      offers: [],
      isDebarred: false,
    };

    const profileCompletionPercent = 100;

    const userProfile: Omit<UserProfile, 'id'> = {
      uid: session.uid,
      email: session.email,
      emailVerified: session.emailVerified,
      fullName: fullName,
      rollNumber: rollData.rollNumber,
      gender: input.gender,
      dateOfBirth: new Date(input.dateOfBirth),
      phone: input.phone,
      address: input.address,
      programCode: rollData.programCode,
      programName: rollData.programName,
      department: rollData.department,
      admissionYear: rollData.admissionYear,
      passingYear: rollData.passingYear,
      batch: rollData.batch,
      currentYear: rollData.currentYear,
      isLateralEntry: rollData.isLateralEntry,
      cgpa: input.cgpa,
      activeBacklogs: input.activeBacklogs,
      totalBacklogs: input.activeBacklogs,
      tenthPercentage: input.tenthPercentage,
      tenthBoard: input.tenthBoard,
      tenthYear: input.tenthYear,
      twelfthPercentage: input.twelfthPercentage,
      twelfthBoard: input.twelfthBoard,
      twelfthYear: input.twelfthYear,
      placementStatus,
      appliedDrives: [],
      profileCompletionPercent,
      isProfileComplete: true,
      role: 'student' as UserRole,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLoginAt: new Date(),
    };

    await db.collection('users').doc(session.uid).set(userProfile);

    await auth.setCustomUserClaims(session.uid, {
      role: 'student',
      programCode: rollData.programCode,
    });

    return {
      success: true,
      redirectTo: '/dashboard',
    };
  } catch (error) {
    console.error('Profile completion failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to complete profile',
    };
  }
}

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

export async function updateProfile(
  updates: Partial<Pick<UserProfile, 
    'phone' | 'alternatePhone' | 'address' | 'cgpa' | 'activeBacklogs' | 'resumeUrl'
  >>
): Promise<AuthActionResult> {
  try {
    const session = await getSession();
    if (!session) {
      return {
        success: false,
        error: 'Not authenticated',
      };
    }

    const db = getAdminFirestore();
    await db.collection('users').doc(session.uid).update({
      ...updates,
      updatedAt: new Date(),
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error('Profile update failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update profile',
    };
  }
}

export async function getUserProfile(): Promise<UserProfile | null> {
  try {
    const session = await getSession();
    if (!session) {
      return null;
    }

    const db = getAdminFirestore();
    const userDoc = await db.collection('users').doc(session.uid).get();

    if (!userDoc.exists) {
      return null;
    }

    const data = userDoc.data();
    return serializeFirestoreData(data) as UserProfile;
  } catch (error) {
    console.error('getUserProfile error:', error);
    return null;
  }
}
