-- Solution radicale : Désactiver RLS temporairement pour résoudre la récursion
-- À exécuter dans l'éditeur SQL de Supabase

-- ===============================================
-- SOLUTION RADICALE : DÉSACTIVER RLS TEMPORAIREMENT
-- ===============================================

-- 1. Désactiver complètement RLS sur toutes les tables
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE modules DISABLE ROW LEVEL SECURITY;
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE comments DISABLE ROW LEVEL SECURITY;

-- 2. Supprimer TOUTES les politiques existantes
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON users;
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can update all users" ON users;

DROP POLICY IF EXISTS "Anyone can create user requests" ON user_requests;
DROP POLICY IF EXISTS "Public can read pending requests" ON user_requests;
DROP POLICY IF EXISTS "Authenticated users can update requests" ON user_requests;
DROP POLICY IF EXISTS "Admins can view all user requests" ON user_requests;
DROP POLICY IF EXISTS "Admins can update user requests" ON user_requests;

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON modules;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON modules;
DROP POLICY IF EXISTS "Authenticated users can view modules" ON modules;
DROP POLICY IF EXISTS "Admins and managers can manage modules" ON modules;

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON tasks;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON tasks;
DROP POLICY IF EXISTS "Authenticated users can view tasks" ON tasks;
DROP POLICY IF EXISTS "Users can update tasks assigned to them" ON tasks;
DROP POLICY IF EXISTS "Admins and managers can manage all tasks" ON tasks;
DROP POLICY IF EXISTS "Users can create tasks" ON tasks;

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON comments;
DROP POLICY IF EXISTS "Users can insert their own comments" ON comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON comments;
DROP POLICY IF EXISTS "Authenticated users can view comments" ON comments;
DROP POLICY IF EXISTS "Users can create comments" ON comments;

-- 3. Nettoyer la table users et recréer le profil admin
DELETE FROM users WHERE email = 'manjaka@admin.com';

-- 4. Recréer le profil admin avec l'ID correct
INSERT INTO users (
    id,
    name,
    email,
    role,
    status,
    created_at,
    updated_at
) VALUES (
    '039ed1a2-4216-46f9-8b90-d27e29330362',
    'Manjaka',
    'manjaka@admin.com',
    'admin',
    'active',
    NOW(),
    NOW()
);

-- 5. Créer des politiques ULTRA-SIMPLES (sans récursion)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for authenticated users" ON users FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE user_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for everyone" ON user_requests FOR ALL USING (true);

ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for authenticated users" ON modules FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for authenticated users" ON tasks FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for authenticated users" ON comments FOR ALL USING (auth.role() = 'authenticated');

-- ===============================================
-- MESSAGES DE CONFIRMATION
-- ===============================================

DO $$
BEGIN
    RAISE NOTICE '🔥 SOLUTION RADICALE APPLIQUÉE';
    RAISE NOTICE '✅ RLS réinitialisé avec politiques ultra-simples';
    RAISE NOTICE '👤 Profil admin recréé avec ID: 039ed1a2-4216-46f9-8b90-d27e29330362';
    RAISE NOTICE '📧 Email: manjaka@admin.com';
    RAISE NOTICE '🔑 Mot de passe: mdp123';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  IMPORTANT: Les politiques sont maintenant très permissives';
    RAISE NOTICE '🔒 Vous pourrez les resserrer plus tard une fois que tout fonctionne';
END $$;
