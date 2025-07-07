/**
 * Script pour vérifier le schéma de la base de données Supabase
 */

import { supabase } from './supabase';

export async function checkDatabaseSchema() {
  console.log('🔍 Vérification du schéma de base de données...');
  
  const requiredTables = [
    {
      name: 'users',
      columns: ['id', 'name', 'email', 'role', 'avatar', 'created_at']
    },
    {
      name: 'modules', 
      columns: ['id', 'name', 'description', 'color', 'created_at']
    },
    {
      name: 'tasks',
      columns: ['id', 'title', 'description', 'assigned_to', 'module_id', 'status', 'priority', 'estimated_time', 'actual_time', 'due_date', 'created_at', 'updated_at']
    },
    {
      name: 'comments',
      columns: ['id', 'text', 'author_id', 'task_id', 'created_at']
    }
  ];

  let allTablesValid = true;

  for (const table of requiredTables) {
    try {
      // Tester l'accès à la table
      const { data, error } = await supabase
        .from(table.name)
        .select('*')
        .limit(1);

      if (error) {
        console.error(`❌ Table '${table.name}' non accessible:`, error.message);
        allTablesValid = false;
        continue;
      }

      console.log(`✅ Table '${table.name}' accessible`);

      // Si on a des données, vérifier quelques colonnes clés
      if (data && data.length > 0) {
        const firstRow = data[0];
        const missingColumns = table.columns.filter(col => !(col in firstRow));
        
        if (missingColumns.length > 0) {
          console.warn(`⚠️ Colonnes manquantes dans '${table.name}':`, missingColumns.join(', '));
        } else {
          console.log(`✅ Structure de '${table.name}' correcte`);
        }
      } else {
        console.log(`ℹ️ Table '${table.name}' vide (normal pour une nouvelle installation)`);
      }

    } catch (err) {
      console.error(`❌ Erreur lors de la vérification de '${table.name}':`, err);
      allTablesValid = false;
    }
  }

  if (allTablesValid) {
    console.log('🎉 Schéma de base de données valide !');
    return true;
  } else {
    console.log('❌ Problèmes détectés dans le schéma.');
    console.log('📋 Solution : Exécutez le contenu de supabase-schema.sql dans l\'éditeur SQL de Supabase');
    return false;
  }
}

// Pour utilisation dans le navigateur
if (typeof window !== 'undefined') {
  (window as any).checkDatabaseSchema = checkDatabaseSchema;
}
