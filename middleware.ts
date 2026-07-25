import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const allowedOrigins = [
  'http://localhost:3000',
  'https://localhost:3000',
  'http://127.0.0.1:3000',
  'https://relearn-apaya.vercel.app'
];

export function middleware(request: NextRequest) {
  const origin = request.headers.get('origin') || '';
  const originAllowed = allowedOrigins.includes(origin);

  if (request.method === 'OPTIONS') {
    const headers: Record<string, string> = {
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
      Vary: 'Origin',
    };

    if (originAllowed) {
      headers['Access-Control-Allow-Origin'] = origin;
    }

    return new NextResponse(null, {
      status: 204,
      headers,
    });
  }

  const response = NextResponse.next();

  if (originAllowed) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Vary', 'Origin');
  }

  return response;
}

export const config = {
  matcher: ['/api/:path*'],
};
