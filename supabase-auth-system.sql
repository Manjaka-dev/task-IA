-- Mise à jour du schéma pour le système d'authentification avancé

-- Table pour les demandes d'inscription en attente
CREATE TABLE user_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(50) CHECK (role IN ('admin', 'manager', 'developer', 'designer')) DEFAULT 'developer',
  status VARCHAR(20) CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES users(id),
  rejection_reason TEXT
);

-- Ajouter des colonnes à la table users pour gérer l'authentification
ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(20) CHECK (status IN ('active', 'inactive', 'suspended')) DEFAULT 'active';
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW());

-- Créer l'utilisateur administrateur par défaut
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  gen_random_uuid(),
  'manjaka@admin.com',
  crypt('mdp123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Manjaka", "role": "admin"}',
  false,
  'authenticated'
) ON CONFLICT (email) DO NOTHING;

-- Créer le profil utilisateur pour l'admin
INSERT INTO users (
  id,
  name,
  email,
  role,
  status,
  created_at
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'manjaka@admin.com'),
  'Manjaka',
  'manjaka@admin.com',
  'admin',
  'active',
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Activer RLS pour la nouvelle table
ALTER TABLE user_requests ENABLE ROW LEVEL SECURITY;

-- Politiques pour user_requests (seuls les admins peuvent voir/gérer)
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

-- Permettre l'insertion publique pour les demandes d'inscription
CREATE POLICY "Anyone can create user requests" ON user_requests
  FOR INSERT WITH CHECK (true);

-- Index pour les performances
CREATE INDEX idx_user_requests_status ON user_requests(status);
CREATE INDEX idx_user_requests_email ON user_requests(email);
