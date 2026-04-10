import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  
  // Redirect www to non-www for consistency
  if (hostname.startsWith('www.')) {
    const url = request.nextUrl.clone();
    const newHostname = hostname.replace('www.', '');
    
    // Build the redirect URL properly
    url.hostname = newHostname.split(':')[0]; // Remove port if present
    // Keep the same protocol, path, and search params
    
    return NextResponse.redirect(url, 301);
  }

  // Handle CORS for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const response = NextResponse.next();
    
    // Get origin from request
    const origin = request.headers.get('origin');
    
    // Allow requests from both www and non-www versions during transition
    const allowedOrigins = [
      'https://sntasty.com',
      'https://www.sntasty.com',
      'http://localhost:3000',
      'http://127.0.0.1:3000',
    ];

    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      response.headers.set(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, DELETE, OPTIONS'
      );
      response.headers.set(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, X-Requested-With'
      );
    }

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers: response.headers,
      });
    }

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
