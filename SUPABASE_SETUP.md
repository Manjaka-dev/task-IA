# Configuration Supabase - Gestionnaire de Tâches

## 🚀 Configuration rapide

Votre application est déjà configurée pour utiliser Supabase ! Suivez ces étapes simples :

### 1. Variables d'environnement

Le fichier `.env.local` est déjà configuré avec vos credentials :

```env
NEXT_PUBLIC_SUPABASE_URL=https://cfxhauelwgrbtutxzzay.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmeGhhdWVsd2dyYnR1dHh6emF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4ODI0MzAsImV4cCI6MjA2NzQ1ODQzMH0.xgM0KuEKJ79P39_zgnNV1-zz2bHu7E8mYqwsgUmpGQE
```

### 2. Configuration de la base de données

1. Connectez-vous à votre [tableau de bord Supabase](https://app.supabase.com)
2. Accédez à votre projet : `cfxhauelwgrbtutxzzay`
3. Allez dans **SQL Editor**
4. Copiez et exécutez le contenu du fichier `supabase-schema.sql`

### 3. Installation et démarrage

```bash
# Installer les dépendances
npm install

# Démarrer l'application
npm run dev
```

### 4. Initialiser les données de test (optionnel)

Une fois l'application démarrée, cliquez sur le bouton **"Initialiser les données"** dans l'interface pour créer des données de test.

## 📋 Structure des tables

L'application utilise 4 tables principales :

### `users` - Utilisateurs
- `id` (UUID, PK)
- `name` (VARCHAR)
- `email` (VARCHAR, UNIQUE)
- `role` (admin|manager|developer|designer)
- `avatar` (TEXT, optionnel)
- `created_at` (TIMESTAMP)

### `modules` - Modules de projet
- `id` (UUID, PK)
- `name` (VARCHAR)
- `description` (TEXT)
- `color` (VARCHAR - code couleur hex)
- `created_at` (TIMESTAMP)

### `tasks` - Tâches
- `id` (UUID, PK)
- `title` (VARCHAR)
- `description` (TEXT, optionnel)
- `assigned_to` (UUID, FK vers users)
- `module_id` (UUID, FK vers modules)
- `status` (todo|in-progress|review|completed)
- `priority` (low|medium|high|urgent)
- `estimated_time` (INTEGER - en heures)
- `actual_time` (INTEGER - en heures)
- `due_date` (TIMESTAMP, optionnel)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### `comments` - Commentaires sur les tâches
- `id` (UUID, PK)
- `text` (TEXT)
- `author_id` (UUID, FK vers users)
- `task_id` (UUID, FK vers tasks)
- `created_at` (TIMESTAMP)

## 🔧 Fonctionnalités

### ✅ Déjà implémentées avec Supabase :

- **Tableau de bord** : Statistiques en temps réel depuis la base de données
- **Gestion des tâches** : CRUD complet avec Supabase
- **Gestion des utilisateurs** : CRUD complet avec Supabase  
- **Gestion des modules** : CRUD complet avec Supabase
- **Initialisation automatique** : Script de seed pour créer des données de test
- **Gestion des erreurs** : Affichage des erreurs de connexion
- **Actualisation** : Boutons pour recharger les données

### 🎯 Services Supabase disponibles :

- `userService` : Gestion des utilisateurs
- `moduleService` : Gestion des modules  
- `taskService` : Gestion des tâches
- `commentService` : Gestion des commentaires
- `dashboardService` : Statistiques et métriques

## 🔍 Débogage

### Problèmes courants :

1. **Erreur de connexion** : Vérifiez vos variables d'environnement
2. **Tables non trouvées** : Exécutez le schéma SQL dans Supabase
3. **Données manquantes** : Utilisez le bouton "Initialiser les données"

### Logs utiles :

Les erreurs sont loggées dans la console du navigateur. Ouvrez les DevTools (F12) pour voir les détails.

## 📊 Sécurité

L'application utilise Row Level Security (RLS) avec des politiques permissives pour le développement. En production, vous devriez :

1. Configurer l'authentification Supabase
2. Ajuster les politiques RLS selon vos besoins
3. Limiter les accès selon les rôles utilisateurs

## 🆘 Support

Si vous rencontrez des problèmes :

1. Vérifiez que votre projet Supabase est actif
2. Assurez-vous que le schéma SQL a été exécuté
3. Vérifiez les logs dans la console du navigateur
4. Vérifiez les logs dans votre tableau de bord Supabase
