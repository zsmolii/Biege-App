import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Die App nutzt das AuthGuard Component auf der Hauptseite für Login
export function middleware(request: NextRequest) {
  return NextResponse.next()
}

// Optional: Konfiguriere welche Pfade die Middleware ausführen soll
export const config = {
  matcher: [
    /*
     * Match alle Pfade außer:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
