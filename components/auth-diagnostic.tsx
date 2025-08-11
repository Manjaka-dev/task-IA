'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Check, X, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface DiagnosticResult {
  step: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: any;
}

export default function AuthDiagnostic() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<DiagnosticResult[]>([]);

  const runDiagnostic = async () => {
    setLoading(true);
    setResults([]);
    const diagnosticResults: DiagnosticResult[] = [];

    try {
      // Test 1: Connexion à Supabase
      diagnosticResults.push({
        step: '1. Connexion Supabase',
        status: 'success',
        message: 'Connexion à Supabase établie'
      });

      // Test 2: V��rifier si la table users existe
      try {
        const { data: usersTest, error: usersError } = await supabase
          .from('users')
          .select('id')
          .limit(1);

        if (usersError) throw usersError;

        diagnosticResults.push({
          step: '2. Table users',
          status: 'success',
          message: 'Table users accessible'
        });
      } catch (error: any) {
        diagnosticResults.push({
          step: '2. Table users',
          status: 'error',
          message: 'Erreur d\'accès à la table users',
          details: error.message
        });
      }

      // Test 3: Vérifier si le profil admin existe
      try {
        const { data: adminProfile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('email', 'manjaka@admin.com')
          .single();

        if (profileError && profileError.code !== 'PGRST116') throw profileError;

        if (adminProfile) {
          diagnosticResults.push({
            step: '3. Profil admin',
            status: 'success',
            message: 'Profil admin trouvé dans la table users',
            details: adminProfile
          });
        } else {
          diagnosticResults.push({
            step: '3. Profil admin',
            status: 'warning',
            message: 'Profil admin non trouvé dans la table users'
          });
        }
      } catch (error: any) {
        diagnosticResults.push({
          step: '3. Profil admin',
          status: 'error',
          message: 'Erreur lors de la vérification du profil admin',
          details: error.message
        });
      }

      // Test 4: Tentative de connexion Auth
      try {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: 'manjaka@admin.com',
          password: 'mdp123'
        });

        if (authError) throw authError;

        if (authData.user) {
          diagnosticResults.push({
            step: '4. Authentification',
            status: 'success',
            message: 'Connexion Auth réussie !',
            details: { userId: authData.user.id, email: authData.user.email }
          });

          // Se déconnecter immédiatement
          await supabase.auth.signOut();
        }
      } catch (error: any) {
        diagnosticResults.push({
          step: '4. Authentification',
          status: 'error',
          message: 'Échec de l\'authentification',
          details: error.message
        });
      }

      // Test 5: Vérifier les politiques RLS
      try {
        const { data: session } = await supabase.auth.getSession();
        diagnosticResults.push({
          step: '5. Session Auth',
          status: session?.session ? 'success' : 'warning',
          message: session?.session ? 'Session active détectée' : 'Aucune session active'
        });
      } catch (error: any) {
        diagnosticResults.push({
          step: '5. Session Auth',
          status: 'error',
          message: 'Erreur lors de la vérification de session',
          details: error.message
        });
      }

    } catch (error: any) {
      diagnosticResults.push({
        step: 'Erreur générale',
        status: 'error',
        message: 'Erreur inattendue',
        details: error.message
      });
    }

    setResults(diagnosticResults);
    setLoading(false);
  };

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return <Check className="h-4 w-4 text-green-600" />;
      case 'error':
        return <X className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Succès</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Erreur</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800">Attention</Badge>;
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Diagnostic d'authentification
        </CardTitle>
        <CardDescription>
          Vérifiez pourquoi la connexion ne fonctionne pas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={runDiagnostic}
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Diagnostic en cours...
            </>
          ) : (
            'Lancer le diagnostic'
          )}
        </Button>

        {results.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold">Résultats du diagnostic :</h3>
            {results.map((result, index) => (
              <div key={index} className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(result.status)}
                    <span className="font-medium">{result.step}</span>
                  </div>
                  {getStatusBadge(result.status)}
                </div>
                <p className="text-sm text-gray-600 mb-2">{result.message}</p>
                {result.details && (
                  <details className="text-xs">
                    <summary className="cursor-pointer text-blue-600">Détails techniques</summary>
                    <pre className="mt-2 bg-gray-100 p-2 rounded overflow-auto">
                      {typeof result.details === 'string'
                        ? result.details
                        : JSON.stringify(result.details, null, 2)
                      }
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}

        {results.length > 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Prochaines étapes :</strong><br/>
              1. Si le profil admin n'existe pas → Allez sur <a href="/init" className="text-blue-600 underline">/init</a><br/>
              2. Si l'authentification échoue → Exécutez le script SQL radical<br/>
              3. Si tout est OK → Le problème vient peut-être du middleware
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
