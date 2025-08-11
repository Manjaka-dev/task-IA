// Script pour vérifier s'il y a des utilisateurs dans la base
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkUsers() {
  console.log('🔍 Vérification des utilisateurs existants...');

  try {
    // Vérifier les utilisateurs dans auth.users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
      console.error('❌ Erreur auth:', authError);
      return;
    }

    console.log(`📊 Utilisateurs auth: ${authUsers.users.length}`);

    if (authUsers.users.length > 0) {
      console.log('👥 Utilisateurs trouvés:');
      authUsers.users.forEach((user, index) => {
        console.log(`  ${index + 1}. ${user.email} (ID: ${user.id})`);
      });
    }

    // Vérifier les profils utilisateur
    const { data: profiles, error: profileError } = await supabase
      .from('users')
      .select('*');

    if (profileError) {
      console.error('❌ Erreur profils:', profileError);
    } else {
      console.log(`📊 Profils utilisateur: ${profiles.length}`);
      if (profiles.length > 0) {
        console.log('👤 Profils trouvés:');
        profiles.forEach((profile, index) => {
          console.log(`  ${index + 1}. ${profile.name} (${profile.email}) - Role: ${profile.role}`);
        });
      }
    }

    if (authUsers.users.length === 0) {
      console.log('\n💡 Aucun utilisateur trouvé. Vous devez:');
      console.log('   1. Aller sur http://localhost:3001/init');
      console.log('   2. Créer le premier compte administrateur');
    } else {
      console.log('\n💡 Utilisateurs existants trouvés. Vous pouvez:');
      console.log('   1. Aller sur http://localhost:3001/login');
      console.log('   2. Vous connecter avec un des comptes existants');
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

checkUsers();
