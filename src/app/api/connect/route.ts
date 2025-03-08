// app/api/connect/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifySyncCode, generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { syncCode } = body;

    if (!syncCode) {
      return NextResponse.json({ error: 'Sync code is required' }, { status: 400 });
    }

    // Verify the sync code
    const userId = await verifySyncCode(syncCode);

    if (!userId) {
      return NextResponse.json({ error: 'Invalid or expired sync code' }, { status: 401 });
    }

    // Generate an auth token
    const token = await generateToken(userId);

    return NextResponse.json({ token });
  } catch (error) {
    console.error('Connect error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
