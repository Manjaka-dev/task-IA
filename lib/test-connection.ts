/**
 * Test de connexion Supabase
 * Exécutez ce script pour vérifier que la connexion à Supabase fonctionne
 */

import { supabase } from '../lib/supabase';

export async function testSupabaseConnection() {
  console.log('🔌 Test de connexion Supabase...');
  
  try {
    // Test 1: Vérifier la connexion de base
    const { data, error } = await supabase.from('users').select('count');
    
    if (error) {
      console.error('❌ Erreur de connexion:', error.message);
      return false;
    }
    
    console.log('✅ Connexion Supabase réussie !');
    
    // Test 2: Vérifier les tables
    const tables = ['users', 'modules', 'tasks', 'comments'];
    
    for (const table of tables) {
      try {
        const { error: tableError } = await supabase.from(table).select('*').limit(1);
        if (tableError) {
          console.error(`❌ Table '${table}' non accessible:`, tableError.message);
          return false;
        }
        console.log(`✅ Table '${table}' accessible`);
      } catch (err) {
        console.error(`❌ Erreur table '${table}':`, err);
        return false;
      }
    }
    
    console.log('🎉 Tous les tests de connexion sont passés !');
    return true;
    
  } catch (error) {
    console.error('❌ Erreur fatale:', error);
    return false;
  }
}

// Pour utilisation dans le navigateur
if (typeof window !== 'undefined') {
  (window as any).testSupabaseConnection = testSupabaseConnection;
}
