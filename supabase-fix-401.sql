-- Script pour corriger les erreurs 401 Supabase
-- À exécuter dans Supabase Dashboard > SQL Editor

-- ===========================
-- DÉSACTIVER RLS (Row Level Security)
-- ===========================

-- Désactiver RLS sur toutes les tables
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks DISABLE ROW LEVEL SECURITY;

-- ===========================
-- ALTERNATIVE: ACTIVER RLS AVEC POLITIQUES PERMISSIVES
-- ===========================

-- Si vous préférez garder RLS actif, utilisez ces politiques :

-- Pour la table users
-- ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow all operations on users" ON public.users FOR ALL USING (true);

-- Pour la table modules
-- ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow all operations on modules" ON public.modules FOR ALL USING (true);

-- Pour la table tasks
-- ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow all operations on tasks" ON public.tasks FOR ALL USING (true);

-- ===========================
-- VÉRIFIER LES PERMISSIONS
-- ===========================

-- Vérifier que l'utilisateur anonymous peut accéder aux tables
GRANT ALL ON public.users TO anon;
GRANT ALL ON public.modules TO anon;
GRANT ALL ON public.tasks TO anon;

GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.modules TO authenticated;
GRANT ALL ON public.tasks TO authenticated;

-- ===========================
-- TEST DE CONNEXION
-- ===========================

-- Tester que les données sont accessibles
SELECT 'Test users table' as test, count(*) as count FROM public.users;
SELECT 'Test modules table' as test, count(*) as count FROM public.modules;
SELECT 'Test tasks table' as test, count(*) as count FROM public.tasks;
