'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Check, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function InitAdminForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const initializeAdmin = async () => {
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      console.log('🚀 Début de l\'initialisation...');

      // 1. Essayer de créer l'utilisateur administrateur
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: 'manjaka@admin.com',
        password: 'mdp123',
        options: {
          data: {
            name: 'Manjaka',
            role: 'admin'
          }
        }
      });

      console.log('📧 Résultat inscription:', { signUpData, signUpError });

      let userId = signUpData?.user?.id;

      // 2. Si l'utilisateur existe déjà ou si on a une erreur "already registered"
      if (signUpError && signUpError.message.includes('already registered')) {
        console.log('👤 Utilisateur déjà existant, récupération de l\'ID...');

        // Essayer de se connecter pour récupérer l'ID
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: 'manjaka@admin.com',
          password: 'mdp123'
        });

        if (signInData?.user?.id) {
          userId = signInData.user.id;
          console.log('✅ ID utilisateur récupéré:', userId);

          // Se déconnecter immédiatement
          await supabase.auth.signOut();
        } else if (signInError) {
          console.error('❌ Erreur connexion:', signInError);
          throw new Error('Impossible de récupérer l\'utilisateur existant: ' + signInError.message);
        }
      } else if (signUpError) {
        console.error('❌ Erreur inscription:', signUpError);
        throw signUpError;
      }

      // 3. Créer ou mettre à jour le profil dans la table users
      if (userId) {
        console.log('📝 Création du profil utilisateur...');

        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .upsert({
            id: userId,
            name: 'Manjaka',
            email: 'manjaka@admin.com',
            role: 'admin',
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'id'
          })
          .select();

        console.log('👤 Résultat profil:', { profileData, profileError });

        if (profileError) {
          console.error('❌ Erreur profil:', profileError);
          throw new Error('Erreur lors de la création du profil: ' + profileError.message);
        }

        console.log('✅ Profil créé avec succès');
      } else {
        throw new Error('Impossible de récupérer l\'ID utilisateur');
      }

      setSuccess(true);
      console.log('🎉 Initialisation terminée avec succès!');

    } catch (error: any) {
      console.error('❌ Erreur complète:', error);
      setError(error.message || 'Erreur lors de l\'initialisation');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-green-600 flex items-center gap-2">
            <Check className="h-5 w-5" />
            Initialisation réussie !
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="border-green-200 bg-green-50">
            <Check className="h-4 w-4" />
            <AlertDescription className="text-green-800">
              Le compte administrateur a été créé avec succès.<br/>
              <strong>Email:</strong> manjaka@admin.com<br/>
              <strong>Mot de passe:</strong> mdp123<br/><br/>
              <a
                href="/login"
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Aller à la page de connexion
              </a>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Configuration initiale requise
        </CardTitle>
        <CardDescription>
          Le compte administrateur doit être créé avant la première utilisation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Alert>
          <AlertDescription>
            Cette action va créer le compte administrateur avec les identifiants suivants :<br/>
            <strong>Email:</strong> manjaka@admin.com<br/>
            <strong>Mot de passe:</strong> mdp123
          </AlertDescription>
        </Alert>

        <Button
          onClick={initializeAdmin}
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            'Initialisation en cours...'
          ) : (
            'Créer le compte administrateur'
          )}
        </Button>

        <div className="text-sm text-gray-600">
          <strong>Important:</strong> Assurez-vous d'avoir exécuté le script SQL dans Supabase avant de continuer.
        </div>
      </CardContent>
    </Card>
  );
}
