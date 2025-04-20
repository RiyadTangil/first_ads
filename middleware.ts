import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  // Skip middleware for API routes and error pages
  const { pathname } = req.nextUrl;
  
  if (
    pathname.includes('/api/') || 
    pathname.includes('/auth/error') ||
    pathname.startsWith('/_next/') ||
    pathname.includes('/favicon.ico') ||
    pathname === '/auth/register' // Explicitly allow register route
  ) {
    return NextResponse.next();
  }

  // For client-side only auth, we'll rely more on client validation
  // But we still protect sensitive server-side routes
  
  // Check for auth token in cookies or Authorization header
  const authHeader = req.headers.get('authorization');
  const token = authHeader ? authHeader.split(' ')[1] : null;
  
  let isAuth = false;
  let userRole = null;
  
  if (token) {
    try {
      // Verify the token
      const decoded = jwt.verify(
        token, 
        process.env.NEXTAUTH_SECRET || 'your-fallback-secret'
      ) as any;
      
      isAuth = true;
      userRole = decoded.role;
    } catch (err) {
      // Invalid token
      isAuth = false;
    }
  }

  // Auth pages should redirect to dashboard if authenticated
  // But registration page should always be accessible
  if (pathname.startsWith('/auth/') && 
      pathname !== '/auth/register' &&
      isAuth) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // For admin routes, server-side check is still important
  if (pathname.startsWith('/admin')) {
    if (!isAuth) {
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }
    
    if (userRole !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  // For dashboard, client-side checks will handle most auth
  // This is just a fallback for direct URL access
  if (pathname.startsWith('/dashboard') && !isAuth) {
    // Allow through to let client handle - it will redirect if needed
    return NextResponse.next();
  }

  return NextResponse.next();
}

// Configure routes that require protection
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 