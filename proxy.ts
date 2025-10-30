// in der Datei ./proxy.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Die Funktion MUSS als 'default' oder als 'proxy' exportiert werden.
export function proxy(request: NextRequest) {
  // Ihre Proxy-Logik kommt hier rein.
  // Wenn Sie momentan nur einen Platzhalter brauchen, verwenden Sie diesen.
  return NextResponse.next();
}

// Optional: Konfiguration (passt an, auf welchen Pfaden der Proxy laufen soll)
export const config = {
  // Dies würde den Proxy auf alle Pfade anwenden.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
