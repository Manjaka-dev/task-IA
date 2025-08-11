'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { storageService } from '@/lib/storage-service';

export default function SessionDebugPage() {
  const [sessionInfo, setSessionInfo] = useState<any>({});

  const checkSessionDetails = () => {
    try {
      const sessionStr = storageService.getItem('taskmanager_session');
      const userStr = storageService.getItem('taskmanager_user');

      if (sessionStr) {
        const session = JSON.parse(sessionStr);
        const now = new Date();
        const expirationTime = new Date(session.expires_at);
        const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

        setSessionInfo({
          hasSession: true,
          hasUser: !!userStr,
          raw_expires_at: session.expires_at,
          expires_at_parsed: expirationTime.toISOString(),
          current_time: now.toISOString(),
          time_until_expiry: Math.round((expirationTime.getTime() - now.getTime()) / 1000 / 60), // minutes
          is_expired: expirationTime < now,
          expires_soon: expirationTime < fiveMinutesFromNow,
          session_duration: session.expires_in || 'unknown',
          session_type: session.token_type || 'unknown',
          full_session: session
        });
      } else {
        setSessionInfo({
          hasSession: false,
          hasUser: !!userStr,
          message: 'Aucune session trouvée dans localStorage'
        });
      }
    } catch (error) {
      setSessionInfo({
        error: error.message,
        hasSession: false,
        hasUser: false
      });
    }
  };

  const clearStorage = () => {
    storageService.clear();
    setSessionInfo({});
    console.log('🗑️ Storage vidé');
  };

  useEffect(() => {
    checkSessionDetails();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🕒 Diagnostic de Session</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button onClick={checkSessionDetails}>
              🔄 Vérifier la session
            </Button>
            <Button onClick={clearStorage} variant="destructive">
              🗑️ Vider le stockage
            </Button>
          </div>

          {Object.keys(sessionInfo).length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Détails de la session :</h3>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
                {JSON.stringify(sessionInfo, null, 2)}
              </pre>
            </div>
          )}

          {sessionInfo.hasSession && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`p-4 rounded border ${sessionInfo.is_expired ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                <h4 className="font-medium">État de la session</h4>
                <p className={sessionInfo.is_expired ? 'text-red-600' : 'text-green-600'}>
                  {sessionInfo.is_expired ? '❌ Expirée' : '✅ Valide'}
                </p>
                {sessionInfo.time_until_expiry && (
                  <p className="text-sm text-gray-600">
                    Expire dans : {sessionInfo.time_until_expiry} minutes
                  </p>
                )}
              </div>

              <div className="p-4 rounded border bg-blue-50 border-blue-200">
                <h4 className="font-medium">Durée de session</h4>
                <p className="text-blue-600">
                  {sessionInfo.session_duration} secondes
                </p>
                <p className="text-sm text-gray-600">
                  Type : {sessionInfo.session_type}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
