'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { authService } from '@/lib/auth-service';
import { User } from '@/lib/types';

interface AuthContextType {
  user: SupabaseUser | null;
  userProfile: User | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const refreshProfile = async () => {
    if (user) {
      try {
        const profile = await authService.getUserProfile(user.id);
        setUserProfile(profile);
        setIsAdmin(profile.role === 'admin');
      } catch (error) {
        console.error('Erreur lors du chargement du profil:', error);
      }
    }
  };

  // Vérifier l'authentification au chargement et écouter les changements
  useEffect(() => {
    let isChecking = false; // Flag pour éviter les vérifications multiples

    const checkAuth = async () => {
      if (isChecking) {
        console.log('🔄 Vérification déjà en cours, skip...');
        return;
      }

      isChecking = true;

      try {
        console.log('🔄 AuthProvider - Vérification localStorage...');

        const currentUser = await authService.getCurrentUser();
        const session = await authService.getSession();

        console.log('📋 localStorage check:', {
          userExists: !!currentUser,
          sessionExists: !!session?.session,
        });

        if (currentUser && session?.session) {
          setUser(currentUser);
          console.log('👤 Chargement du profil pour:', currentUser.email);

          try {
            const profile = await authService.getUserProfile(currentUser.id);
            setUserProfile(profile);
            setIsAdmin(profile.role === 'admin');
            console.log('✅ Profil chargé:', profile.name, '-', profile.role);
          } catch (profileError) {
            console.error('❌ Erreur profil:', profileError);
            // Ne pas déconnecter automatiquement, juste ne pas charger le profil
          }
        } else {
          console.log('❌ Pas d\'authentification valide dans localStorage');
          setUser(null);
          setUserProfile(null);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Erreur lors de la vérification auth:', error);
        setUser(null);
        setUserProfile(null);
        setIsAdmin(false);
      } finally {
        setLoading(false);
        isChecking = false;
      }
    };

    // Vérification initiale
    checkAuth();

    // Écouter les changements du localStorage avec throttling
    let debounceTimer: NodeJS.Timeout;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.startsWith('taskmanager_')) {
        console.log('🔄 Changement localStorage détecté:', e.key);

        // Debounce pour éviter les vérifications trop fréquentes
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          checkAuth();
        }, 500);
      }
    };

    const handleCustomStorageChange = () => {
      console.log('🔄 Changement localStorage interne détecté');

      // Debounce pour les changements internes aussi
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        checkAuth();
      }, 500);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('taskmanager-auth-change', handleCustomStorageChange);

    return () => {
      clearTimeout(debounceTimer);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('taskmanager-auth-change', handleCustomStorageChange);
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('🔐 Début de la connexion...');
    const { user: authUser, session } = await authService.login({ email, password });

    if (authUser && session) {
      console.log('✅ Utilisateur authentifié:', authUser.id);
      setUser(authUser);

      // Forcer le rechargement du profil ET sauvegarder dans localStorage
      try {
        const profile = await authService.getUserProfile(authUser.id);
        setUserProfile(profile);
        setIsAdmin(profile.role === 'admin');

        // S'assurer que tout est bien sauvegardé dans localStorage
        localStorage.setItem('taskmanager_user', JSON.stringify(authUser));
        localStorage.setItem('taskmanager_session', JSON.stringify(session));
        localStorage.setItem('taskmanager_profile', JSON.stringify(profile));

        console.log('✅ Profil chargé et sauvegardé:', profile);
      } catch (error) {
        console.error('❌ Erreur profil:', error);
        // Si le profil n'existe pas, on déconnecte l'utilisateur
        console.log('❌ Profil manquant, déconnexion...');
        await authService.logout();
        setUser(null);
        setUserProfile(null);
        setIsAdmin(false);
        throw new Error('Profil utilisateur manquant. Contactez l\'administrateur.');
      }
    }
  };

  const signOut = async () => {
    console.log('👋 Déconnexion...');
    await authService.logout();
    setUser(null);
    setUserProfile(null);
    setIsAdmin(false);
    console.log('✅ Déconnexion terminée');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        isAdmin,
        signIn,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
}
