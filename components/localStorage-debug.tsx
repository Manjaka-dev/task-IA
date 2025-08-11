'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Check, X, AlertCircle, Trash } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { authService } from '@/lib/auth-service';
import { storageService } from '@/lib/storage-service';

export default function LocalStorageDebug() {
  const [storageData, setStorageData] = useState<any>({});
  const [storageStatus, setStorageStatus] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);
  const [repairAttempted, setRepairAttempted] = useState(false);

  const addTestResult = (message: string) => {
    setTestResults(prev => [...prev, message]);
    console.log(message);
  };

  const checkStorageStatus = () => {
    const status = authService.getStorageStatus();
    setStorageStatus(status);

    addTestResult(`📊 Mode de stockage: ${status.mode}`);
    addTestResult(`💾 localStorage disponible: ${status.localStorage ? '✅' : '❌'}`);
    addTestResult(`🧠 Éléments en mémoire: ${status.memoryItems}`);
  };

  const checkLocalStorage = () => {
    try {
      const user = storageService.getItem('taskmanager_user');
      const session = storageService.getItem('taskmanager_session');
      const profile = storageService.getItem('taskmanager_profile');

      const data = {
        user: user ? JSON.parse(user) : null,
        session: session ? JSON.parse(session) : null,
        profile: profile ? JSON.parse(profile) : null,
        userRaw: user,
        sessionRaw: session,
        profileRaw: profile
      };

      setStorageData(data);
      addTestResult('📋 Données de stockage récupérées');

      if (data.user) {
        addTestResult(`👤 Utilisateur: ${data.user.email}`);
      }
      if (data.session) {
        const expiresAt = new Date(data.session.expires_at);
        const isExpired = expiresAt < new Date();
        addTestResult(`⏱️ Session: ${isExpired ? 'Expirée' : 'Valide'} (expire le ${expiresAt.toLocaleString()})`);
      }
      if (data.profile) {
        addTestResult(`👥 Profil: ${data.profile.name} (${data.profile.role})`);
      }
    } catch (error) {
      console.error('Erreur localStorage:', error);
      setStorageData({ error: error.message });
      addTestResult(`❌ Erreur: ${error.message}`);
    }
  };

  const clearLocalStorage = () => {
    storageService.clear();
    setTestResults([]);
    setRepairAttempted(false);
    checkLocalStorage();
    checkStorageStatus();
    addTestResult('🗑️ Stockage vidé');
  };

  const repairStorage = async () => {
    setLoading(true);
    setRepairAttempted(true);
    addTestResult('🔧 Tentative de réparation du stockage...');

    try {
      const success = await authService.repairStorage();

      if (success) {
        addTestResult('✅ Stockage réparé avec succès');
      } else {
        addTestResult('⚠️ Réparation impossible, mode mémoire maintenu');
      }

      checkStorageStatus();
      checkLocalStorage();
    } catch (error) {
      addTestResult(`❌ Échec de la réparation: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testStorageWrite = async () => {
    setLoading(true);
    addTestResult('✏️ Test d\'écriture dans le stockage...');

    try {
      const testData = { test: true, timestamp: Date.now() };
      const success = storageService.setItem('test_write', JSON.stringify(testData));

      if (success) {
        const retrieved = storageService.getItem('test_write');
        if (retrieved) {
          const parsed = JSON.parse(retrieved);
          if (parsed.test === true) {
            addTestResult('✅ Test d\'écriture réussi');
          } else {
            addTestResult('❌ Données corrompues lors de l\'écriture');
          }
        } else {
          addTestResult('❌ Impossible de récupérer les données écrites');
        }
        storageService.removeItem('test_write');
      } else {
        addTestResult('❌ Échec de l\'écriture');
      }
    } catch (error) {
      addTestResult(`❌ Erreur lors du test: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testSupabaseConnection = async () => {
    setLoading(true);
    addTestResult('🔗 Test de connexion Supabase...');

    try {
      const { data, error } = await supabase.from('users').select('id').limit(1);

      if (error) {
        addTestResult(`❌ Erreur Supabase: ${error.message}`);
      } else {
        addTestResult('✅ Connexion Supabase OK');
      }
    } catch (error) {
      addTestResult(`❌ Erreur de connexion: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkLocalStorage();
    checkStorageStatus();
  }, []);

  const getStorageModeColor = (mode: string) => {
    switch (mode) {
      case 'localStorage': return 'bg-green-500';
      case 'memory': return 'bg-yellow-500';
      case 'hybrid': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Diagnostic du Stockage LocalStorage
          </CardTitle>
          <CardDescription>
            Vérification du stockage local et diagnostic des problèmes de connexion
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Statut du stockage */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Badge className={getStorageModeColor(storageStatus.mode)}>
                    {storageStatus.mode || 'Inconnu'}
                  </Badge>
                  <span className="text-sm font-medium">Mode de stockage</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  {storageStatus.localStorage ?
                    <Check className="w-4 h-4 text-green-500" /> :
                    <X className="w-4 h-4 text-red-500" />
                  }
                  <span className="text-sm font-medium">localStorage</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Mémoire: {storageStatus.memoryItems || 0}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <Button onClick={checkLocalStorage} variant="outline">
              🔄 Vérifier le stockage
            </Button>

            <Button onClick={testStorageWrite} disabled={loading} variant="outline">
              {loading ? null : null}
              ✏️ Tester l'écriture
            </Button>

            <Button onClick={testSupabaseConnection} disabled={loading} variant="outline">
              {loading ? null : null}
              🔗 Tester Supabase
            </Button>

            {!storageStatus.localStorage && (
              <Button onClick={repairStorage} disabled={loading || repairAttempted} variant="outline">
                {loading ? null : null}
                🔧 Réparer le stockage
              </Button>
            )}

            <Button onClick={clearLocalStorage} variant="destructive">
              <Trash className="w-4 h-4 mr-2" />
              Vider le stockage
            </Button>
          </div>

          {/* Messages d'alerte */}
          {storageStatus.mode === 'memory' && (
            <Alert>
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>
                ⚠️ Le localStorage n'est pas disponible. L'application utilise le stockage en mémoire.
                Vos données seront perdues lors du rechargement de la page.
              </AlertDescription>
            </Alert>
          )}

          {storageStatus.mode === 'hybrid' && (
            <Alert>
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>
                🔄 Mode hybride détecté. Certaines données sont en mémoire, d'autres dans localStorage.
              </AlertDescription>
            </Alert>
          )}

          {/* Résultats des tests */}
          {testResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Résultats des tests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-100 p-4 rounded-lg max-h-60 overflow-y-auto">
                  {testResults.map((result, index) => (
                    <div key={index} className="text-sm font-mono mb-1">
                      {result}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Données actuelles */}
          {Object.keys(storageData).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Données actuelles</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-auto max-h-60">
                  {JSON.stringify(storageData, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
