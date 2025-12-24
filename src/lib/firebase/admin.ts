import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getStorage, Storage } from 'firebase-admin/storage';

// Validate server environment
function validateServerEnvironment(): void {
  if (typeof window !== 'undefined') {
    throw new Error(
      'Firebase Admin SDK cannot be used on the client side. ' +
        'This module should only be imported in Server Components, Server Actions, or API routes.'
    );
  }

  const requiredVars = [
    'FIREBASE_ADMIN_PROJECT_ID',
    'FIREBASE_ADMIN_CLIENT_EMAIL',
    'FIREBASE_ADMIN_PRIVATE_KEY',
  ];

  for (const envVar of requiredVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required server environment variable: ${envVar}`);
    }
  }
}

// Singleton pattern for Firebase Admin
let adminApp: App;
let adminAuth: Auth;
let adminDb: Firestore;
let adminStorage: Storage;

function getAdminApp(): App {
  validateServerEnvironment();

  if (getApps().length === 0) {
    adminApp = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        // Handle newline characters in the private key
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
  } else {
    adminApp = getApps()[0]!;
  }

  return adminApp;
}

export function getAdminAuth(): Auth {
  if (!adminAuth) {
    adminAuth = getAuth(getAdminApp());
  }
  return adminAuth;
}

export function getAdminFirestore(): Firestore {
  if (!adminDb) {
    adminDb = getFirestore(getAdminApp());
  }
  return adminDb;
}

export function getAdminStorage(): Storage {
  if (!adminStorage) {
    adminStorage = getStorage(getAdminApp());
  }
  return adminStorage;
}

// Session cookie configuration
export const SESSION_COOKIE_NAME = '__session';
export const SESSION_COOKIE_OPTIONS = {
  maxAge: 60 * 60 * 24 * 5 * 1000, // 5 days in milliseconds
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

export async function createSessionCookie(idToken: string): Promise<string> {
  const auth = getAdminAuth();
  const expiresIn = SESSION_COOKIE_OPTIONS.maxAge;
  
  return auth.createSessionCookie(idToken, { expiresIn });
}

export async function verifySessionCookie(sessionCookie: string): Promise<{
  uid: string;
  email: string;
  emailVerified: boolean;
  role?: 'admin' | 'tpo' | 'student';
  programCode?: string;
} | null> {
  try {
    const auth = getAdminAuth();
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
    
    return {
      uid: decodedClaims.uid,
      email: decodedClaims.email ?? '',
      emailVerified: decodedClaims.email_verified ?? false,
      role: decodedClaims.role as 'admin' | 'tpo' | 'student' | undefined,
      programCode: decodedClaims.programCode as string | undefined,
    };
  } catch (error) {
    console.error('Session cookie verification failed:', error);
    return null;
  }
}

export async function revokeUserSessions(uid: string): Promise<void> {
  const auth = getAdminAuth();
  await auth.revokeRefreshTokens(uid);
}
