-- Script de création d'un utilisateur admin complet
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Supprimer l'utilisateur existant s'il y en a un (optionnel)
DELETE FROM auth.users WHERE email = 'manjaka@admin.com';
DELETE FROM users WHERE email = 'manjaka@admin.com';

-- 2. Créer l'utilisateur dans auth.users avec un ID spécifique
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
    NULL,
    NULL,
    '{"provider": "email", "providers": ["email"]}',
    '{"name": "Manjaka"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
);

-- 3. Récupérer l'ID de l'utilisateur créé
DO $$
DECLARE
    user_id UUID;
BEGIN
    SELECT id INTO user_id FROM auth.users WHERE email = 'manjaka@admin.com';

    -- 4. Créer le profil dans la table users
    INSERT INTO users (
        id,
        name,
        email,
        role,
        status,
        created_at,
        updated_at
    ) VALUES (
        user_id,
        'Manjaka',
        'manjaka@admin.com',
        'admin',
        'active',
        NOW(),
        NOW()
    );
END $$;

-- 5. Vérifier que tout est créé correctement
SELECT
    'auth.users' as table_name,
    au.id::text as user_id,
    au.email,
    CASE WHEN au.email_confirmed_at IS NOT NULL THEN 'confirmed' ELSE 'not_confirmed' END as status
FROM auth.users au
WHERE au.email = 'manjaka@admin.com'

UNION ALL

SELECT
    'users' as table_name,
    u.id::text as user_id,
    u.email,
    u.role as status
FROM users u
WHERE u.email = 'manjaka@admin.com';
