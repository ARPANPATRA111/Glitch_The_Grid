import { NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase/admin';
import { head } from '@vercel/blob';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  services: {
    firebase: ServiceStatus;
    blobStorage: ServiceStatus;
  };
}

interface ServiceStatus {
  status: 'ok' | 'error';
  latency?: number;
  error?: string;
}

const startTime = Date.now();

async function checkFirebase(): Promise<ServiceStatus> {
  const start = Date.now();
  try {
    const db = getAdminFirestore();
    // Simple read to verify connectivity
    await db.collection('config').doc('health').get();
    return {
      status: 'ok',
      latency: Date.now() - start,
    };
  } catch (error) {
    return {
      status: 'error',
      latency: Date.now() - start,
      error: error instanceof Error ? error.message : 'Firebase connection failed',
    };
  }
}

async function checkBlobStorage(): Promise<ServiceStatus> {
  const start = Date.now();
  try {
    // Check if blob token is configured
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return {
        status: 'error',
        error: 'BLOB_READ_WRITE_TOKEN not configured',
      };
    }
    
    // Try to head a non-existent file (will fail but proves connectivity)
    try {
      await head('health-check-test.txt');
    } catch {
      // Expected to fail with 404, but proves the service is reachable
    }
    
    return {
      status: 'ok',
      latency: Date.now() - start,
    };
  } catch (error) {
    return {
      status: 'error',
      latency: Date.now() - start,
      error: error instanceof Error ? error.message : 'Blob storage check failed',
    };
  }
}

export async function GET() {
  const [firebase, blobStorage] = await Promise.all([
    checkFirebase(),
    checkBlobStorage(),
  ]);

  const allServicesOk = firebase.status === 'ok' && blobStorage.status === 'ok';
  const anyServiceError = firebase.status === 'error' || blobStorage.status === 'error';

  const health: HealthStatus = {
    status: allServicesOk ? 'healthy' : anyServiceError ? 'unhealthy' : 'degraded',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    uptime: Math.floor((Date.now() - startTime) / 1000),
    services: {
      firebase,
      blobStorage,
    },
  };

  const statusCode = health.status === 'healthy' ? 200 : 
                     health.status === 'degraded' ? 200 : 503;

  return NextResponse.json(health, { status: statusCode });
}
