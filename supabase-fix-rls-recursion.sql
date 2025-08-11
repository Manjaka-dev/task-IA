-- Script SQL corrigé pour éviter la récursion infinie dans les politiques RLS
-- À exécuter dans l'éditeur SQL de Supabase pour remplacer les politiques défectueuses

-- ===============================================
-- CORRECTION DES POLITIQUES RLS
-- ===============================================

-- 1. Supprimer toutes les politiques existantes pour éviter les conflits
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can update all users" ON users;
DROP POLICY IF EXISTS "Anyone can create user requests" ON user_requests;
DROP POLICY IF EXISTS "Admins can view all user requests" ON user_requests;
DROP POLICY IF EXISTS "Admins can update user requests" ON user_requests;
DROP POLICY IF EXISTS "Authenticated users can view modules" ON modules;
DROP POLICY IF EXISTS "Admins and managers can manage modules" ON modules;
DROP POLICY IF EXISTS "Authenticated users can view tasks" ON tasks;
DROP POLICY IF EXISTS "Users can update tasks assigned to them" ON tasks;
DROP POLICY IF EXISTS "Admins and managers can manage all tasks" ON tasks;
DROP POLICY IF EXISTS "Users can create tasks" ON tasks;
DROP POLICY IF EXISTS "Authenticated users can view comments" ON comments;
DROP POLICY IF EXISTS "Users can create comments" ON comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON comments;

-- ===============================================
-- POLITIQUES RLS CORRIGÉES (SANS RÉCURSION)
-- ===============================================

-- Politiques pour la table users (CORRIGÉES)
CREATE POLICY "Enable read access for authenticated users" ON users
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Permettre l'insertion initiale (pour la création de profils)
CREATE POLICY "Enable insert for authenticated users" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Politiques pour user_requests (SANS RÉCURSION)
CREATE POLICY "Anyone can create user requests" ON user_requests
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can read pending requests" ON user_requests
    FOR SELECT USING (status = 'pending');

CREATE POLICY "Authenticated users can update requests" ON user_requests
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Politiques pour modules (SIMPLIFIÉES)
CREATE POLICY "Enable read access for authenticated users" ON modules
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all access for authenticated users" ON modules
    FOR ALL USING (auth.role() = 'authenticated');

-- Politiques pour tasks (SIMPLIFIÉES)
CREATE POLICY "Enable read access for authenticated users" ON tasks
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all access for authenticated users" ON tasks
    FOR ALL USING (auth.role() = 'authenticated');

-- Politiques pour comments (SIMPLIFIÉES)
CREATE POLICY "Enable read access for authenticated users" ON comments
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert their own comments" ON comments
    FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own comments" ON comments
    FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own comments" ON comments
    FOR DELETE USING (auth.uid() = author_id);

-- ===============================================
-- CRÉATION MANUELLE DU COMPTE ADMINISTRATEUR
-- ===============================================

-- Approche alternative : Créer un utilisateur temporaire pour permettre l'init
-- Désactiver temporairement RLS pour permettre l'insertion
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Insérer manuellement un profil admin temporaire
INSERT INTO users (
    id,
    name,
    email,
    role,
    status,
    created_at,
    updated_at
) VALUES (
    '039ed1a2-4216-46f9-8b90-d27e29330362', -- ID fixe pour les tests
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

-- Réactiver RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- ===============================================
-- MESSAGES DE CONFIRMATION
-- ===============================================

DO $$
BEGIN
    RAISE NOTICE '✅ Politiques RLS corrigées (récursion supprimée)';
    RAISE NOTICE '👤 Profil administrateur créé/mis à jour';
    RAISE NOTICE '🔐 Email: manjaka@admin.com';
    RAISE NOTICE '🔑 Mot de passe: mdp123';
    RAISE NOTICE '';
    RAISE NOTICE '📌 IMPORTANT:';
    RAISE NOTICE '1. Vous devez d''abord créer l''utilisateur auth via /init';
    RAISE NOTICE '2. Ou bien utiliser l''interface d''administration Supabase';
    RAISE NOTICE '3. L''ID utilisateur doit correspondre à celui dans auth.users';
END $$;
