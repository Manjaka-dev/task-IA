import { Metadata } from 'next';
import Link from 'next/link';
import ForgotPasswordForm from './forgot-password-form';

export const metadata: Metadata = {
  title: 'Mot de passe oublié | Application de Gestion de Tâches',
  description: 'Réinitialisez votre mot de passe',
};

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
      <div className="mx-auto w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Mot de passe oublié</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Entrez votre email pour recevoir un lien de réinitialisation
          </p>
        </div>

        <ForgotPasswordForm />

        <div className="text-center text-sm">
          <p>
            <Link href="/login" className="underline underline-offset-4 hover:text-primary">
              Retour à la connexion
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
