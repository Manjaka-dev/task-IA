#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Configuration de l\'application...\n');

// Vérifier si .env.local existe
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('❌ Fichier .env.local manquant !');
  console.log('Créez un fichier .env.local avec vos credentials Supabase.\n');
  console.log('Exemple :');
  console.log('NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-cle-api\n');
  process.exit(1);
}

console.log('✅ Fichier .env.local trouvé');

// Vérifier les variables d'environnement
const envContent = fs.readFileSync(envPath, 'utf8');
const hasUrl = envContent.includes('NEXT_PUBLIC_SUPABASE_URL');
const hasKey = envContent.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY');

if (!hasUrl || !hasKey) {
  console.log('❌ Variables d\'environnement manquantes dans .env.local');
  process.exit(1);
}

console.log('✅ Variables d\'environnement configurées');

// Vérifier si node_modules existe
if (!fs.existsSync(path.join(process.cwd(), 'node_modules'))) {
  console.log('📦 Installation des dépendances...');
  require('child_process').execSync('npm install', { stdio: 'inherit' });
}

console.log('✅ Dépendances installées');

console.log('\n🎉 Configuration terminée !');
console.log('\nCommandes disponibles :');
console.log('  npm run dev      - Démarrer en développement');
console.log('  npm run build    - Build de production');
console.log('  npm run seed     - Initialiser les données test');
console.log('\nL\'application sera disponible sur http://localhost:3000');
