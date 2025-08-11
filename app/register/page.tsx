import { Metadata } from 'next';
import Link from 'next/link';
import RegisterForm from './register-form';

export const metadata: Metadata = {
  title: 'Inscription | Application de Gestion de Tâches',
  description: 'Créez un nouveau compte pour commencer à utiliser l\'application',
};

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
      <div className="mx-auto w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Créer un compte</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Complétez le formulaire ci-dessous pour créer votre compte
          </p>
        </div>

        <RegisterForm />

        <div className="text-center text-sm">
          <p>
            Vous avez déjà un compte ?{' '}
            <Link href="/login" className="underline underline-offset-4 hover:text-primary">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
