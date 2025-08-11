/**
 * Service de stockage robuste qui gère localStorage et les fallbacks
 */

// Clés pour le localStorage
const STORAGE_KEYS = {
  USER: 'taskmanager_user',
  SESSION: 'taskmanager_session',
  PROFILE: 'taskmanager_profile'
};

export class StorageService {
  private static instance: StorageService;
  private isLocalStorageAvailable = false;
  private memoryStorage: Map<string, string> = new Map();
  private isClient = false;

  constructor() {
    this.isClient = typeof window !== 'undefined';
    if (this.isClient) {
      this.checkLocalStorageAvailability();
    }
  }

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  /**
   * Vérifier si localStorage est disponible et fonctionnel
   */
  private checkLocalStorageAvailability(): void {
    if (!this.isClient) {
      this.isLocalStorageAvailable = false;
      return;
    }

    try {
      const testKey = '__test_localStorage__';
      const testValue = 'test';

      localStorage.setItem(testKey, testValue);
      const retrieved = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);

      this.isLocalStorageAvailable = retrieved === testValue;

      if (this.isLocalStorageAvailable) {
        console.log('✅ localStorage est disponible et fonctionnel');
      } else {
        console.warn('⚠️ localStorage n\'est pas fonctionnel, utilisation du stockage mémoire');
      }
    } catch (error) {
      console.error('❌ localStorage n\'est pas disponible:', error);
      this.isLocalStorageAvailable = false;
    }
  }

  /**
   * Sauvegarder une valeur dans le stockage
   */
  setItem(key: string, value: string): boolean {
    // Si on est côté serveur, utiliser seulement la mémoire
    if (!this.isClient) {
      this.memoryStorage.set(key, value);
      return true;
    }

    try {
      if (this.isLocalStorageAvailable) {
        localStorage.setItem(key, value);
        console.log(`💾 Sauvegardé dans localStorage: ${key}`);
      } else {
        this.memoryStorage.set(key, value);
        console.log(`💾 Sauvegardé en mémoire: ${key}`);
      }
      return true;
    } catch (error) {
      console.error(`❌ Erreur de sauvegarde ${key}:`, error);
      // Fallback vers le stockage mémoire
      try {
        this.memoryStorage.set(key, value);
        console.log(`💾 Fallback mémoire pour: ${key}`);
        return true;
      } catch (fallbackError) {
        console.error(`❌ Échec du fallback mémoire:`, fallbackError);
        return false;
      }
    }
  }

  /**
   * Récupérer une valeur du stockage
   */
  getItem(key: string): string | null {
    // Si on est côté serveur, utiliser seulement la mémoire
    if (!this.isClient) {
      return this.memoryStorage.get(key) || null;
    }

    try {
      if (this.isLocalStorageAvailable) {
        const value = localStorage.getItem(key);
        if (value) {
          console.log(`📥 Récupéré depuis localStorage: ${key}`);
          return value;
        }
      }

      // Fallback vers le stockage mémoire
      const memoryValue = this.memoryStorage.get(key);
      if (memoryValue) {
        console.log(`📥 Récupéré depuis la mémoire: ${key}`);
        return memoryValue;
      }

      return null;
    } catch (error) {
      console.error(`❌ Erreur de récupération ${key}:`, error);
      return this.memoryStorage.get(key) || null;
    }
  }

  /**
   * Supprimer une valeur du stockage
   */
  removeItem(key: string): void {
    try {
      if (this.isClient && this.isLocalStorageAvailable) {
        localStorage.removeItem(key);
      }
      this.memoryStorage.delete(key);
      console.log(`🗑️ Supprimé: ${key}`);
    } catch (error) {
      console.error(`❌ Erreur de suppression ${key}:`, error);
    }
  }

  /**
   * Vider tout le stockage
   */
  clear(): void {
    try {
      if (this.isClient && this.isLocalStorageAvailable) {
        // Supprimer seulement nos clés
        Object.values(STORAGE_KEYS).forEach(key => {
          localStorage.removeItem(key);
        });
      }
      this.memoryStorage.clear();
      console.log('🗑️ Stockage vidé');
    } catch (error) {
      console.error('❌ Erreur lors du vidage:', error);
    }
  }

  /**
   * Obtenir le statut du stockage
   */
  getStorageStatus(): {
    localStorage: boolean;
    memoryItems: number;
    mode: 'localStorage' | 'memory' | 'hybrid';
    isClient: boolean;
  } {
    const memoryItems = this.memoryStorage.size;
    let mode: 'localStorage' | 'memory' | 'hybrid' = 'localStorage';

    if (!this.isClient || !this.isLocalStorageAvailable) {
      mode = 'memory';
    } else if (memoryItems > 0) {
      mode = 'hybrid';
    }

    return {
      localStorage: this.isClient && this.isLocalStorageAvailable,
      memoryItems,
      mode,
      isClient: this.isClient
    };
  }

  /**
   * Tenter de réparer localStorage
   */
  async repairStorage(): Promise<boolean> {
    if (!this.isClient) {
      console.log('⚠️ Impossible de réparer le stockage côté serveur');
      return false;
    }

    console.log('🔧 Tentative de réparation du stockage...');

    try {
      // Sauvegarder les données actuelles
      const currentData = new Map<string, string>();
      Object.values(STORAGE_KEYS).forEach(key => {
        const value = this.getItem(key);
        if (value) {
          currentData.set(key, value);
        }
      });

      // Vider et tester localStorage
      this.clear();
      this.checkLocalStorageAvailability();

      // Restaurer les données si localStorage fonctionne maintenant
      if (this.isLocalStorageAvailable) {
        currentData.forEach((value, key) => {
          this.setItem(key, value);
        });
        console.log('✅ Stockage réparé avec succès');
        return true;
      }

      console.log('⚠️ localStorage toujours non disponible');
      return false;
    } catch (error) {
      console.error('❌ Échec de la réparation:', error);
      return false;
    }
  }
}

// Export de l'instance singleton - attention au SSR
export const storageService = (() => {
  if (typeof window !== 'undefined') {
    return StorageService.getInstance();
  }
  // Côté serveur, retourner un objet mock
  return {
    setItem: () => false,
    getItem: () => null,
    removeItem: () => {},
    clear: () => {},
    getStorageStatus: () => ({
      localStorage: false,
      memoryItems: 0,
      mode: 'memory' as const,
      isClient: false
    }),
    repairStorage: async () => false
  };
})();

export { STORAGE_KEYS };
