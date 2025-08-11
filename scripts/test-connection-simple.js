// Test de connexion Supabase avec clé publique uniquement
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testConnection() {
  console.log('🔍 Test de connexion Supabase...');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  console.log('📍 URL:', supabaseUrl);
  console.log('🔑 Clé (premiers chars):', supabaseKey ? supabaseKey.substring(0, 20) + '...' : 'MANQUANTE');

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Variables d\'environnement manquantes');
    return;
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Test simple de connexion (ne nécessite pas de clé service)
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (error) {
      console.error('❌ Erreur de connexion:', error.message);
      if (error.message.includes('relation "users" does not exist')) {
        console.log('💡 La table "users" n\'existe pas encore.');
        console.log('   Vous devez peut-être exécuter les migrations SQL sur Supabase.');
      }
    } else {
      console.log('✅ Connexion Supabase réussie !');
      console.log('💡 Vous pouvez maintenant aller sur http://localhost:3001/init');
    }

  } catch (err) {
    console.error('❌ Erreur de test:', err.message);
  }
}

testConnection();
