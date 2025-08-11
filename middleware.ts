import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/request';

export async function middleware(req: NextRequest) {
  // Ne pas traiter les ressources statiques
  if (req.nextUrl.pathname.startsWith('/_next') ||
      req.nextUrl.pathname.startsWith('/favicon') ||
      req.nextUrl.pathname.includes('.')) {
    return NextResponse.next();
  }

  // Pour une application basée sur localStorage, on laisse l'AuthGuard côté client gérer l'authentification
  // Le middleware ne peut pas accéder au localStorage, donc on laisse passer toutes les routes
  console.log('🟢 Route autorisée (AuthGuard gérera l\'auth):', req.nextUrl.pathname);
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
