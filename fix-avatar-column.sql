-- Script pour corriger le problème de colonne 'avatar' manquante
-- Exécutez ceci dans Supabase Dashboard > SQL Editor

-- Vérifier si la colonne avatar existe
DO $$
BEGIN
    -- Essayer d'ajouter la colonne avatar si elle n'existe pas
    BEGIN
        ALTER TABLE public.users ADD COLUMN avatar TEXT;
        RAISE NOTICE 'Colonne avatar ajoutée avec succès';
    EXCEPTION
        WHEN duplicate_column THEN
            RAISE NOTICE 'Colonne avatar existe déjà';
    END;
END $$;

-- Mettre à jour les utilisateurs existants avec un avatar par défaut
UPDATE public.users 
SET avatar = CASE 
    WHEN role = 'admin' THEN '👨‍💼'
    WHEN role = 'manager' THEN '👥'
    WHEN role = 'developer' THEN '👨‍💻'
    WHEN role = 'designer' THEN '🎨'
    ELSE '👤'
END
WHERE avatar IS NULL;

-- Vérifier la structure de la table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;
