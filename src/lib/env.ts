import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1, 'Firebase API key is required'),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().min(1, 'Firebase auth domain is required'),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1, 'Firebase project ID is required'),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().min(1, 'Firebase storage bucket is required'),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().min(1, 'Firebase messaging sender ID is required'),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string().min(1, 'Firebase app ID is required'),
  
  FIREBASE_ADMIN_PROJECT_ID: z.string().min(1, 'Firebase Admin project ID is required'),
  FIREBASE_ADMIN_CLIENT_EMAIL: z.string().email('Firebase Admin client email must be valid'),
  FIREBASE_ADMIN_PRIVATE_KEY: z.string().min(1, 'Firebase Admin private key is required'),
  
  SESSION_SECRET_KEY: z.string().min(32, 'Session secret must be at least 32 characters'),
  
  BLOB_READ_WRITE_TOKEN: z.string().min(1, 'Vercel Blob token is required'),
  
  GOOGLE_GEMINI_API_KEY: z.string().optional(),
  
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).optional(),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(): Env {
  const result = envSchema.safeParse(process.env);
  
  if (!result.success) {
    const errors = result.error.errors.map(err => {
      return `  - ${err.path.join('.')}: ${err.message}`;
    }).join('\n');
    
    console.error('❌ Environment validation failed:');
    console.error(errors);
    console.error('\nPlease check your .env.local file and ensure all required variables are set.');
    console.error('See .env.example for reference.');
    
    throw new Error(`Environment validation failed:\n${errors}`);
  }
  
  return result.data;
}

let cachedEnv: Env | null = null;

export function getEnv(): Env {
  if (!cachedEnv) {
    cachedEnv = validateEnv();
  }
  return cachedEnv;
}

export function hasEnvVar(key: keyof Env): boolean {
  return !!process.env[key];
}

export function getDocumentAIKey(): string | undefined {
  return process.env.GOOGLE_GEMINI_API_KEY;
}
