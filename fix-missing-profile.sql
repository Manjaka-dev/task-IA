-- Script pour corriger le profil utilisateur manquant
-- À exécuter dans l'éditeur SQL de Supabase

-- Insérer le profil utilisateur pour l'admin existant
INSERT INTO users (
    id,
    name,
    email,
    role,
    status,
    created_at,
    updated_at
)
SELECT
    id,
    'Manjaka',
    email,
    'admin',
    'active',
    NOW(),
    NOW()
FROM auth.users
WHERE email = 'manjaka@admin.com'
AND NOT EXISTS (
    SELECT 1 FROM users WHERE users.id = auth.users.id
);

-- Vérifier que l'insertion a fonctionné
SELECT
    u.id,
    u.name,
    u.email,
    u.role,
    'Profil créé avec succès' as status
FROM users u
WHERE u.email = 'manjaka@admin.com';
