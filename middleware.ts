import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Die Middleware wird nur benötigt, wenn Sie spezifisches Routing für Authentifizierung machen.
// Da Sie sie nicht benötigen, exportieren wir eine leere Funktion, die nichts tut.
export function middleware(request: NextRequest) {
  return NextResponse.next()
}

// Deaktiviert die Middleware für bestimmte Pfade. 
// Hier wird nur der /_next/static-Ordner ignoriert.
export const config = {
  matcher: [
    /*
     * Match alle Pfade außer:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - und alle anderen statischen Dateien in /public
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
