// Script de test de connexion Supabase
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('=== DIAGNOSTIC SUPABASE ===');
console.log('URL:', supabaseUrl);
console.log('Key (premiers chars):', supabaseKey ? supabaseKey.substring(0, 20) + '...' : 'UNDEFINED');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement manquantes !');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('\n🔍 Test de connexion...');
    
    // Test simple
    const { data, error } = await supabase
      .from('tasks')
      .select('count(*)')
      .limit(1);
    
    if (error) {
      console.error('❌ Erreur Supabase:', error);
      console.error('Code:', error.code);
      console.error('Message:', error.message);
      
      if (error.code === 'PGRST116') {
        console.log('\n💡 Solution: La table "tasks" n\'existe pas.');
        console.log('   Exécutez le schema SQL dans Supabase Dashboard.');
      }
      
      if (error.message.includes('RLS')) {
        console.log('\n💡 Solution: Problème de Row Level Security.');
        console.log('   Désactivez RLS ou ajoutez des politiques.');
      }
      
    } else {
      console.log('✅ Connexion réussie !');
      console.log('Données:', data);
    }
    
  } catch (err) {
    console.error('❌ Erreur réseau:', err);
  }
}

testConnection();
