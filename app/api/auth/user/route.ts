import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    // Get the user's session
    const session = await getServerSession(authOptions);

    // If no session exists, return unauthorized
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Return the user data
    return NextResponse.json({
      id: session.user.id,
      name: session.user.name,
      username: session.user.username,
      email: session.user.email,
      role: session.user.role,
    });
  } catch (error: any) {
    console.error('Error fetching user data:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 