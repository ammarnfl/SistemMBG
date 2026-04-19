import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const publicRoutes = ['/login', '/api/auth/login'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  // Get token from cookie
  const token = request.cookies.get('auth_token')?.value;

  if (isPublicRoute) {
    if (token) {
      try {
        // If logged in, redirect away from login
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'ganti-dengan-secret-yang-kuat-minimal-32-karakter');
        const { payload } = await jwtVerify(token, secret);
        
        switch (payload.role) {
          case 'ADMIN':
            return NextResponse.redirect(new URL('/admin', request.url));
          case 'TIM_DAPUR':
            return NextResponse.redirect(new URL('/dapur', request.url));
          case 'GURU':
            return NextResponse.redirect(new URL('/guru', request.url));
          case 'PENERIMA_MANFAAT':
            return NextResponse.redirect(new URL('/penerima-manfaat', request.url));
          default:
            return NextResponse.redirect(new URL('/', request.url));
        }
      } catch (err) {
        // Token invalid, allow to login page
      }
    }
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'ganti-dengan-secret-yang-kuat-minimal-32-karakter');
    const { payload } = await jwtVerify(token, secret);
    const role = payload.role as string;

    // Based on requirements mapping, check role bounds
    if (pathname.startsWith('/admin') && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
    if (pathname.startsWith('/dapur') && role !== 'TIM_DAPUR') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
    if (pathname.startsWith('/guru') && role !== 'GURU') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
    if (pathname.startsWith('/penerima-manfaat') && role !== 'PENERIMA_MANFAAT') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    // Role is valid, attach to headers for server components or client usage if needed
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-role', role);
    requestHeaders.set('x-user-id', payload.sub as string);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error('Middleware JWT Error:', error);
    // Delete invalid token
    const res = NextResponse.redirect(new URL('/login', request.url));
    res.cookies.delete('auth_token');
    return res;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
