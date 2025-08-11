'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth-provider';
import { authService } from '@/lib/auth-service';
import { storageService } from '@/lib/storage-service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestAuthPage() {
  const { user, userProfile, loading } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    const gatherDebugInfo = async () => {
      const storageStatus = authService.getStorageStatus();
      const currentUser = await authService.getCurrentUser();
      const session = await authService.getSession();
      
      const userData = storageService.getItem('taskmanager_user');
      const sessionData = storageService.getItem('taskmanager_session');
      const profileData = storageService.getItem('taskmanager_profile');

      setDebugInfo({
        authContext: {
          user: user ? { id: user.id, email: user.email } : null,
          userProfile: userProfile ? { id: userProfile.id, name: userProfile.name, role: userProfile.role } : null,
          loading
        },
        authService: {
          currentUser: currentUser ? { id: currentUser.id, email: currentUser.email } : null,
          session: session?.session ? 'Présente' : 'Absente'
        },
        storage: {
          status: storageStatus,
          rawData: {
            user: userData ? 'Présent' : 'Absent',
            session: sessionData ? 'Présent' : 'Absent',
            profile: profileData ? 'Présent' : 'Absent'
          }
        }
      });
    };

    gatherDebugInfo();
  }, [user, userProfile, loading]);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🔍 Test d'Authentification</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">État AuthContext:</h3>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                {JSON.stringify(debugInfo.authContext, null, 2)}
              </pre>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">AuthService:</h3>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                {JSON.stringify(debugInfo.authService, null, 2)}
              </pre>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Stockage:</h3>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                {JSON.stringify(debugInfo.storage, null, 2)}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
