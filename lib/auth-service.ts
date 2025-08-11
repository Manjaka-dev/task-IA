import { supabase } from './supabase';
import { LoginCredentials, RegisterCredentials, User, UserRequest, PasswordChangeRequest } from './types';
import { storageService, STORAGE_KEYS } from './storage-service';

export const authService = {
  /**
   * Connecter un utilisateur avec email et mot de passe
   */
  async login({ email, password }: LoginCredentials) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Sauvegarder dans le stockage robuste
    if (data.user && data.session) {
      const userSaved = storageService.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));
      const sessionSaved = storageService.setItem(STORAGE_KEYS.SESSION, JSON.stringify(data.session));

      if (!userSaved || !sessionSaved) {
        // Tenter de réparer le stockage
        await storageService.repairStorage();
      }

      // Déclencher un événement pour notifier le changement
      window.dispatchEvent(new CustomEvent('taskmanager-auth-change'));

      // Mettre à jour la date de dernière connexion
      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', data.user.id);
    }

    return data;
  },

  /**
   * Déconnecter l'utilisateur actuel
   */
  async logout() {
    // Nettoyer le stockage
    storageService.removeItem(STORAGE_KEYS.USER);
    storageService.removeItem(STORAGE_KEYS.SESSION);
    storageService.removeItem(STORAGE_KEYS.PROFILE);

    // Déclencher un événement pour notifier le changement
    window.dispatchEvent(new CustomEvent('taskmanager-auth-change'));

    // Déconnecter de Supabase
    await supabase.auth.signOut();
  },

  /**
   * Récupérer l'utilisateur actuellement connecté depuis le stockage
   */
  async getCurrentUser() {
    try {
      const userStr = storageService.getItem(STORAGE_KEYS.USER);
      if (!userStr) return null;

      const user = JSON.parse(userStr);

      // Vérifier que la session existe
      const sessionStr = storageService.getItem(STORAGE_KEYS.SESSION);
      if (!sessionStr) return null;

      return user;
    } catch (error) {
      return null;
    }
  },

  /**
   * Récupérer la session actuelle depuis le stockage
   */
  async getSession() {
    try {
      const sessionStr = storageService.getItem(STORAGE_KEYS.SESSION);
      const userStr = storageService.getItem(STORAGE_KEYS.USER);

      if (!sessionStr || !userStr) return { session: null };

      const session = JSON.parse(sessionStr);
      const user = JSON.parse(userStr);

      return {
        session: {
          ...session,
          user
        }
      };
    } catch (error) {
      return { session: null };
    }
  },

  /**
   * Récupérer le profil complet de l'utilisateur
   */
  async getUserProfile(userId: string) {
    // D'abord vérifier le cache
    try {
      const profileStr = storageService.getItem(STORAGE_KEYS.PROFILE);
      if (profileStr) {
        const profile = JSON.parse(profileStr);
        if (profile.id === userId) {
          return profile as User;
        }
      }
    } catch (error) {
      console.error('Erreur cache profil:', error);
    }

    // Si pas en cache, récupérer depuis Supabase
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;

    // Sauvegarder en cache
    storageService.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(data));

    return data as User;
  },

  /**
   * Changer le mot de passe de l'utilisateur
   */
  async changePassword({ currentPassword, newPassword }: PasswordChangeRequest) {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Utilisateur non connecté');

    // Tenter de se reconnecter avec le mot de passe actuel pour vérification
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: currentPassword,
    });

    if (verifyError) throw new Error('Mot de passe actuel incorrect');

    // Changer le mot de passe
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) throw error;

    // Mettre à jour la date de changement de mot de passe
    await supabase
      .from('users')
      .update({ password_changed_at: new Date().toISOString() })
      .eq('id', user.id);

    return true;
  },

  /**
   * Créer une demande d'inscription (nécessite approbation admin)
   */
  async requestRegistration({ name, email, password, role = 'developer' }: RegisterCredentials) {
    // Vérifier que l'email n'existe pas déjà
    const { data: existingUser } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .single();

    if (existingUser) {
      throw new Error('Un utilisateur avec cet email existe déjà');
    }

    // Vérifier qu'il n'y a pas déjà une demande en attente
    const { data: existingRequest } = await supabase
      .from('user_requests')
      .select('email')
      .eq('email', email)
      .eq('status', 'pending')
      .single();

    if (existingRequest) {
      throw new Error('Une demande d\'inscription est déjà en attente pour cet email');
    }

    // Créer la demande d'inscription
    const { data, error } = await supabase
      .from('user_requests')
      .insert({
        name,
        email,
        password_hash: password,
        role,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Récupérer toutes les demandes d'inscription en attente
   */
  async getPendingUserRequests(): Promise<UserRequest[]> {
    const { data, error } = await supabase
      .from('user_requests')
      .select(`
        *,
        reviewed_by_user:reviewed_by(name)
      `)
      .eq('status', 'pending')
      .order('requested_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  /**
   * Approuver une demande d'inscription
   */
  async approveUserRequest(requestId: string, adminId: string) {
    // Récupérer les détails de la demande
    const { data: request, error: requestError } = await supabase
      .from('user_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (requestError) throw requestError;
    if (!request) throw new Error('Demande non trouvée');

    // Créer l'utilisateur dans auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: request.email,
      password: request.password_hash,
      email_confirm: true,
      user_metadata: {
        name: request.name,
        role: request.role
      }
    });

    if (authError) throw authError;

    // Créer le profil utilisateur
    if (authData.user) {
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          name: request.name,
          email: request.email,
          role: request.role,
          status: 'active'
        });

      if (profileError) throw profileError;
    }

    // Marquer la demande comme approuvée
    const { error: updateError } = await supabase
      .from('user_requests')
      .update({
        status: 'approved',
        reviewed_at: new Date().toISOString(),
        reviewed_by: adminId
      })
      .eq('id', requestId);

    if (updateError) throw updateError;

    return true;
  },

  /**
   * Refuser une demande d'inscription
   */
  async rejectUserRequest(requestId: string, adminId: string, rejectionReason?: string) {
    const { error } = await supabase
      .from('user_requests')
      .update({
        status: 'rejected',
        reviewed_at: new Date().toISOString(),
        reviewed_by: adminId,
        rejection_reason: rejectionReason
      })
      .eq('id', requestId);

    if (error) throw error;
    return true;
  },

  /**
   * Récupérer tous les utilisateurs (admin uniquement)
   */
  async getAllUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Suspendre/réactiver un utilisateur
   */
  async toggleUserStatus(userId: string, status: 'active' | 'suspended') {
    const { error } = await supabase
      .from('users')
      .update({ status })
      .eq('id', userId);

    if (error) throw error;
    return true;
  },

  /**
   * Vérifier si l'utilisateur actuel est admin
   */
  async isAdmin(): Promise<boolean> {
    const user = await this.getCurrentUser();
    if (!user) return false;

    try {
      const profile = await this.getUserProfile(user.id);
      return profile.role === 'admin';
    } catch (error) {
      return false;
    }
  },

  /**
   * Obtenir le statut du stockage pour le diagnostic
   */
  getStorageStatus() {
    return storageService.getStorageStatus();
  },

  /**
   * Réparer le stockage si nécessaire
   */
  async repairStorage() {
    return await storageService.repairStorage();
  }
};
