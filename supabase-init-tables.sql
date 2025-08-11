-- Script pour créer l'utilisateur administrateur initial
-- À exécuter dans la console SQL de Supabase

-- 1. D'abord, assurez-vous que la table users a les bonnes colonnes
ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(20) CHECK (status IN ('active', 'inactive', 'suspended')) DEFAULT 'active';
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW());

-- 2. Créer la table user_requests si elle n'existe pas
CREATE TABLE IF NOT EXISTS user_requests (
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

-- 3. Activer RLS pour user_requests
ALTER TABLE user_requests ENABLE ROW LEVEL SECURITY;

-- 4. Politiques pour user_requests
DROP POLICY IF EXISTS "Anyone can create user requests" ON user_requests;
DROP POLICY IF EXISTS "Admins can view all user requests" ON user_requests;
DROP POLICY IF EXISTS "Admins can update user requests" ON user_requests;

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

-- 5. Index pour les performances
CREATE INDEX IF NOT EXISTS idx_user_requests_status ON user_requests(status);
CREATE INDEX IF NOT EXISTS idx_user_requests_email ON user_requests(email);
