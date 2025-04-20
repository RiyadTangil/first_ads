import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json(
        { valid: false, error: 'No token provided' },
        { status: 400 }
      );
    }

    try {
      // Verify the token
      const decoded = jwt.verify(
        token,
        process.env.NEXTAUTH_SECRET || 'your-fallback-secret'
      );

      // Token is valid
      return NextResponse.json({
        valid: true,
        user: decoded
      });
    } catch (err) {
      // Token is invalid
      return NextResponse.json(
        { valid: false, error: 'Invalid token' },
        { status: 401 }
      );
    }
  } catch (error: any) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      { valid: false, error: error.message || 'Something went wrong' },
      { status: 500 }
    );
  }
} 