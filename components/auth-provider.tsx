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
        return;
      }

      isChecking = true;

      try {
        const currentUser = await authService.getCurrentUser();
        const session = await authService.getSession();

        if (currentUser && session?.session) {
          setUser(currentUser);

          try {
            const profile = await authService.getUserProfile(currentUser.id);
            setUserProfile(profile);
            setIsAdmin(profile.role === 'admin');
          } catch (profileError) {
            // Ne pas déconnecter automatiquement, juste ne pas charger le profil
          }
        } else {
          setUser(null);
          setUserProfile(null);
          setIsAdmin(false);
        }
      } catch (error) {
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
        // Debounce pour éviter les vérifications trop fréquentes
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          checkAuth();
        }, 500);
      }
    };

    const handleCustomStorageChange = () => {
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
    const { user: authUser, session } = await authService.login({ email, password });

    if (authUser && session) {
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
      } catch (error) {
        // Si le profil n'existe pas, on déconnecte l'utilisateur
        await authService.logout();
        setUser(null);
        setUserProfile(null);
        setIsAdmin(false);
        throw new Error('Profil utilisateur manquant. Contactez l\'administrateur.');
      }
    }
  };

  const signOut = async () => {
    await authService.logout();
    setUser(null);
    setUserProfile(null);
    setIsAdmin(false);
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
