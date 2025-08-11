'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { Loader2Icon } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  // Routes publiques qui ne nécessitent pas d'authentification
  const publicRoutes = [
    '/login',
    '/register',
    '/forgot-password',
    '/diagnostic',
    '/init',
    '/test',
    '/maintenance'
  ];

  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  useEffect(() => {
    const checkAuth = () => {
      // Si c'est une route publique, on laisse passer
      if (isPublicRoute) {
        setIsChecking(false);
        return;
      }

      // Si on est encore en train de charger, on attend
      if (loading) {
        return;
      }

      // Si pas d'utilisateur connecté sur une route privée, rediriger vers login
      if (!user) {
        console.log('🔴 AuthGuard: Pas d\'utilisateur connecté, redirection vers /login');
        router.push(`/login?returnUrl=${encodeURIComponent(pathname)}`);
        return;
      }

      // Utilisateur connecté sur route privée, tout va bien
      setIsChecking(false);
    };

    checkAuth();
  }, [user, loading, pathname, isPublicRoute, router]);

  // Afficher un loader pendant la vérification
  if (isChecking || (loading && !isPublicRoute)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2Icon className="w-8 h-8 animate-spin mx-auto" />
          <p className="text-gray-600">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  // Si c'est une route publique, ou si l'utilisateur est connecté, afficher le contenu
  if (isPublicRoute || user) {
    return <>{children}</>;
  }

  // Fallback: ne rien afficher (la redirection est en cours)
  return null;
}
