'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/components/auth-provider';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn } = useAuth();
  const searchParams = useSearchParams();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Connexion via le service d'authentification
      await signIn(email, password);

      // Récupérer l'URL de retour depuis les paramètres de recherche
      const returnUrl = searchParams.get('returnUrl');
      const redirectTo = returnUrl && returnUrl !== '/' ? returnUrl : '/';

      // Redirection immédiate
      window.location.href = redirectTo;
    } catch (error: any) {
      // Messages d'erreur plus détaillés
      if (error.message?.includes('Invalid login credentials')) {
        setError('Email ou mot de passe incorrect.');
      } else if (error.message?.includes('Email not confirmed')) {
        setError('Email non confirmé. Vérifiez votre boîte mail.');
      } else if (error.message?.includes('Too many requests')) {
        setError('Trop de tentatives. Veuillez patienter quelques minutes.');
      } else {
        setError(error.message || 'Erreur lors de la connexion');
      }
      setLoading(false);
    }
  };

  // Afficher les erreurs depuis l'URL (ex: compte suspendu)
  const urlError = searchParams.get('error');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Connexion</CardTitle>
          <CardDescription className="text-center">
            Connectez-vous à votre compte pour accéder à l&apos;application
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {(error || urlError) && (
              <Alert variant="destructive">
                <AlertDescription>
                  {urlError === 'account_suspended'
                    ? "Votre compte a été suspendu. Contactez l'administrateur."
                    : urlError === 'storage_error'
                    ? "Problème de stockage détecté. Essayez de vider le cache de votre navigateur."
                    : error}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </Button>

            <div className="text-sm text-center space-y-2">
              <Link
                href="/forgot-password"
                className="text-blue-600 hover:underline"
              >
                Mot de passe oublié ?
              </Link>
              <div>
                Pas encore de compte ?{' '}
                <Link
                  href="/register"
                  className="text-blue-600 hover:underline"
                >
                  Demander un accès
                </Link>
              </div>
              <div className="pt-2">
                <Link
                  href="/diagnostic"
                  className="text-gray-500 hover:underline text-xs"
                >
                  🔧 Diagnostic technique
                </Link>
              </div>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
