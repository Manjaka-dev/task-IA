import AuthDiagnostic from '@/components/auth-diagnostic';
import LocalStorageDebug from '@/components/localStorage-debug';

export default function DiagnosticPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Diagnostic d'authentification
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Diagnostiquez et réparez les problèmes d'authentification
          </p>
        </div>

        {/* Debug localStorage en premier */}
        <LocalStorageDebug />

        {/* Diagnostic Supabase en second */}
        <AuthDiagnostic />
      </div>
    </div>
  );
}
