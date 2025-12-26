import { NextResponse } from 'next/server';
import { setCSRFToken } from '@/lib/csrf';

/**
 * API route to set CSRF token
 * GET /api/csrf - Sets a new CSRF token cookie and returns it
 */
export async function GET() {
  try {
    const token = await setCSRFToken();
    
    return NextResponse.json(
      { success: true },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        }
      }
    );
  } catch (error) {
    console.error('[CSRF] Failed to generate token:', error);
    return NextResponse.json(
      { error: 'Failed to generate CSRF token' },
      { status: 500 }
    );
  }
}
