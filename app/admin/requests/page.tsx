'use client';

import { useAuth } from '@/components/auth-provider';
import UserRequestManagement from '@/components/user-request-management';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShieldCheck } from 'lucide-react';

export default function AdminRequestsPage() {
  const { isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">Chargement...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto py-6">
        <Alert variant="destructive">
          <ShieldCheck className="h-4 w-4" />
          <AlertDescription>
            Accès refusé. Vous devez être administrateur pour accéder à cette page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gestion des demandes d'accès</h1>
      </div>

      <UserRequestManagement />
    </div>
  );
}
