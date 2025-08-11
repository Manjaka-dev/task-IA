-- Script SQL complet pour réinitialiser et recréer toutes les tables
-- avec le système d'authentification intégré
-- À exécuter dans l'éditeur SQL de Supabase

-- ===============================================
-- ÉTAPE 1: SUPPRESSION DE TOUTES LES TABLES
-- ===============================================

-- Désactiver RLS temporairement pour éviter les erreurs
SET session_replication_role = replica;

-- Supprimer toutes les policies existantes
DROP POLICY IF EXISTS "Enable all operations for users" ON users;
DROP POLICY IF EXISTS "Enable all operations for modules" ON modules;
DROP POLICY IF EXISTS "Enable all operations for tasks" ON tasks;
DROP POLICY IF EXISTS "Enable all operations for comments" ON comments;
DROP POLICY IF EXISTS "Anyone can create user requests" ON user_requests;
DROP POLICY IF EXISTS "Admins can view all user requests" ON user_requests;
DROP POLICY IF EXISTS "Admins can update user requests" ON user_requests;

-- Supprimer les triggers
DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Supprimer les index
DROP INDEX IF EXISTS idx_tasks_assigned_to;
DROP INDEX IF EXISTS idx_tasks_module_id;
DROP INDEX IF EXISTS idx_tasks_status;
DROP INDEX IF EXISTS idx_tasks_due_date;
DROP INDEX IF EXISTS idx_comments_task_id;
DROP INDEX IF EXISTS idx_comments_author_id;
DROP INDEX IF EXISTS idx_user_requests_status;
DROP INDEX IF EXISTS idx_user_requests_email;

-- Supprimer les tables dans l'ordre correct (en tenant compte des contraintes de clés étrangères)
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS modules CASCADE;
DROP TABLE IF EXISTS user_requests CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Réactiver RLS
SET session_replication_role = DEFAULT;

-- ===============================================
-- ÉTAPE 2: CRÉATION DES TABLES AVEC AUTHENTIFICATION
-- ===============================================

-- Table des utilisateurs avec authentification
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) CHECK (role IN ('admin', 'manager', 'developer', 'designer')) NOT NULL DEFAULT 'developer',
  avatar TEXT,
  status VARCHAR(20) CHECK (status IN ('active', 'inactive', 'suspended')) DEFAULT 'active',
  last_login TIMESTAMP WITH TIME ZONE,
  password_changed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Table des demandes d'inscription
CREATE TABLE user_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(50) CHECK (role IN ('admin', 'manager', 'developer', 'designer')) DEFAULT 'developer',
  status VARCHAR(20) CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  rejection_reason TEXT
);

-- Table des modules
CREATE TABLE modules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  color VARCHAR(7) NOT NULL DEFAULT '#3B82F6', -- Codes couleur hex (#FFFFFF)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Table des tâches
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE NOT NULL,
  status VARCHAR(50) CHECK (status IN ('todo', 'in-progress', 'review', 'completed')) DEFAULT 'todo' NOT NULL,
  priority VARCHAR(50) CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium' NOT NULL,
  estimated_time INTEGER DEFAULT 0, -- en heures
  actual_time INTEGER DEFAULT 0, -- en heures
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Table des commentaires
CREATE TABLE comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  text TEXT NOT NULL,
  author_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ===============================================
-- ÉTAPE 3: CRÉATION DES INDEX POUR LES PERFORMANCES
-- ===============================================

-- Index pour les utilisateurs
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);

-- Index pour les demandes d'inscription
CREATE INDEX idx_user_requests_status ON user_requests(status);
CREATE INDEX idx_user_requests_email ON user_requests(email);
CREATE INDEX idx_user_requests_requested_at ON user_requests(requested_at);

-- Index pour les modules
CREATE INDEX idx_modules_name ON modules(name);

-- Index pour les tâches
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_module_id ON tasks(module_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_created_at ON tasks(created_at);

-- Index pour les commentaires
CREATE INDEX idx_comments_task_id ON comments(task_id);
CREATE INDEX idx_comments_author_id ON comments(author_id);
CREATE INDEX idx_comments_created_at ON comments(created_at);

-- ===============================================
-- ÉTAPE 4: CRÉATION DES TRIGGERS
-- ===============================================

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_modules_updated_at BEFORE UPDATE ON modules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===============================================
-- ÉTAPE 5: ACTIVATION DE ROW LEVEL SECURITY (RLS)
-- ===============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- ===============================================
-- ÉTAPE 6: CRÉATION DES POLITIQUES RLS
-- ===============================================

-- Politiques pour la table users
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid() AND users.role = 'admin'
        )
    );

CREATE POLICY "Admins can update all users" ON users
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid() AND users.role = 'admin'
        )
    );

-- Politiques pour user_requests
CREATE POLICY "Anyone can create user requests" ON user_requests
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all user requests" ON user_requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid() AND users.role = 'admin'
        )
    );

CREATE POLICY "Admins can update user requests" ON user_requests
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid() AND users.role = 'admin'
        )
    );

-- Politiques pour modules
CREATE POLICY "Authenticated users can view modules" ON modules
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins and managers can manage modules" ON modules
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'manager')
        )
    );

-- Politiques pour tasks
CREATE POLICY "Authenticated users can view tasks" ON tasks
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update tasks assigned to them" ON tasks
    FOR UPDATE USING (
        assigned_to = auth.uid() OR
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'manager')
        )
    );

CREATE POLICY "Admins and managers can manage all tasks" ON tasks
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'manager')
        )
    );

CREATE POLICY "Users can create tasks" ON tasks
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Politiques pour comments
CREATE POLICY "Authenticated users can view comments" ON comments
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create comments" ON comments
    FOR INSERT WITH CHECK (
        auth.uid() = author_id AND auth.role() = 'authenticated'
    );

CREATE POLICY "Users can update their own comments" ON comments
    FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own comments" ON comments
    FOR DELETE USING (
        auth.uid() = author_id OR
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'manager')
        )
    );

-- ===============================================
-- ÉTAPE 7: CRÉATION DU COMPTE ADMINISTRATEUR
-- ===============================================

-- Fonction pour créer l'utilisateur administrateur
-- Cette fonction utilise les fonctions administrateur de Supabase
DO $$
DECLARE
    admin_user_id UUID;
    admin_exists BOOLEAN := FALSE;
BEGIN
    -- Vérifier si l'admin existe déjà dans auth.users
    SELECT EXISTS(
        SELECT 1 FROM auth.users
        WHERE email = 'manjaka@admin.com'
    ) INTO admin_exists;

    IF NOT admin_exists THEN
        -- Créer l'utilisateur dans auth.users avec les privilèges admin
        -- Note: Cette approche nécessite des privilèges élevés
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            recovery_sent_at,
            last_sign_in_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            confirmation_token,
            email_change,
            email_change_token_new,
            recovery_token
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            'manjaka@admin.com',
            crypt('mdp123', gen_salt('bf')),
            NOW(),
            NOW(),
            NOW(),
            '{"provider":"email","providers":["email"]}',
            '{"name":"Manjaka","role":"admin"}',
            NOW(),
            NOW(),
            '',
            '',
            '',
            ''
        ) RETURNING id INTO admin_user_id;

        -- Créer le profil dans la table users
        INSERT INTO users (
            id,
            name,
            email,
            role,
            status,
            created_at,
            updated_at
        ) VALUES (
            admin_user_id,
            'Manjaka',
            'manjaka@admin.com',
            'admin',
            'active',
            NOW(),
            NOW()
        );

        RAISE NOTICE '✅ Compte administrateur créé avec succès!';
        RAISE NOTICE '📧 Email: manjaka@admin.com';
        RAISE NOTICE '🔐 Mot de passe: mdp123';
    ELSE
        RAISE NOTICE '⚠️  Le compte administrateur existe déjà dans auth.users';

        -- Récupérer l'ID de l'admin existant
        SELECT id INTO admin_user_id FROM auth.users WHERE email = 'manjaka@admin.com';

        -- Créer ou mettre à jour le profil dans users
        INSERT INTO users (
            id,
            name,
            email,
            role,
            status,
            created_at,
            updated_at
        ) VALUES (
            admin_user_id,
            'Manjaka',
            'manjaka@admin.com',
            'admin',
            'active',
            NOW(),
            NOW()
        ) ON CONFLICT (id) DO UPDATE SET
            role = 'admin',
            status = 'active',
            updated_at = NOW();

        RAISE NOTICE '✅ Profil administrateur synchronisé!';
    END IF;

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Erreur lors de la création du compte admin: %', SQLERRM;
        RAISE NOTICE '💡 Utilisez la page /init de l''application pour créer le compte admin';
END $$;

-- ===============================================
-- ÉTAPE 8: INSERTION DE DONNÉES DE TEST
-- ===============================================

-- Insertion d'un module de test
INSERT INTO modules (name, description, color) VALUES
('Module de test', 'Module de démonstration pour tester le système', '#3B82F6');

-- ===============================================
-- MESSAGES DE CONFIRMATION
-- ===============================================

-- Afficher un message de confirmation
DO $$
BEGIN
    RAISE NOTICE '✅ Toutes les tables ont été supprimées et recréées avec succès!';
    RAISE NOTICE '🔐 Le système d''authentification est configuré';
    RAISE NOTICE '📝 Les politiques RLS sont activées';
    RAISE NOTICE '🚀 Vous pouvez maintenant utiliser l''application';
    RAISE NOTICE '';
    RAISE NOTICE '📌 PROCHAINES ÉTAPES:';
    RAISE NOTICE '1. Allez sur http://localhost:3000/init pour créer le compte admin';
    RAISE NOTICE '2. Connectez-vous avec manjaka@admin.com / mdp123';
    RAISE NOTICE '3. Testez les fonctionnalités d''administration';
END $$;
