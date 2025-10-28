// ./middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default function middleware(request: NextRequest) {
  // Ihre Logik hier
  // Beispiel: return NextResponse.redirect(new URL('/home', request.url));
  return NextResponse.next();
}

// Konfiguration (optional)
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
