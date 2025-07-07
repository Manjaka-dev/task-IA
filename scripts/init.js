#!/usr/bin/env node
/**
 * Script d'initialisation pour l'application Supabase
 * Ce script configure la base de données et initialise les données de test
 */

const { seedDatabase } = require('./lib/seed-data');

async function init() {
  console.log('🚀 Initialisation de l\'application Supabase...');
  
  try {
    console.log('📊 Création des données de test...');
    const result = await seedDatabase();
    
    if (result.success) {
      console.log('✅ Application initialisée avec succès !');
      console.log('');
      console.log('🎯 Prochaines étapes :');
      console.log('1. Assurez-vous que votre base de données Supabase est configurée');
      console.log('2. Exécutez le schéma SQL dans l\'éditeur SQL de Supabase');
      console.log('3. Lancez l\'application avec: npm run dev');
      console.log('');
      console.log('📋 Le schéma SQL se trouve dans: supabase-schema.sql');
    } else {
      console.error('❌ Erreur lors de l\'initialisation:', result.error);
      console.log('');
      console.log('🔧 Solution suggérée :');
      console.log('1. Vérifiez vos variables d\'environnement dans .env.local');
      console.log('2. Assurez-vous que le schéma SQL a été exécuté dans Supabase');
      console.log('3. Vérifiez la connectivité à votre base de données Supabase');
    }
  } catch (error) {
    console.error('❌ Erreur fatale:', error.message);
    process.exit(1);
  }
}

// Exécuter uniquement si appelé directement
if (require.main === module) {
  init();
}

module.exports = { init };
