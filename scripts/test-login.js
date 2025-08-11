// Test simple pour vérifier si l'utilisateur existe dans Supabase
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testLogin() {
  console.log('🔍 Test de connexion avec manjaka@admin.com...');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Variables d\'environnement manquantes');
    return;
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Tenter la connexion
    console.log('🔐 Tentative de connexion...');
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'manjaka@admin.com',
      password: 'mdp123'
    });

    if (error) {
      console.error('❌ Erreur de connexion:', error.message);

      if (error.message.includes('Invalid login credentials')) {
        console.log('💡 L\'utilisateur n\'existe pas ou le mot de passe est incorrect');
        console.log('💡 Vous devez probablement exécuter le script SQL complet');
      }
    } else {
      console.log('✅ Connexion réussie !');
      console.log('👤 Utilisateur:', data.user.email);
      console.log('🔑 Session valide:', !!data.session);

      // Vérifier le profil
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        console.error('❌ Pas de profil trouvé:', profileError.message);
        console.log('💡 Il faut créer l\'entrée dans la table users');
      } else {
        console.log('✅ Profil trouvé:', profile.name, '-', profile.role);
      }

      // Se déconnecter
      await supabase.auth.signOut();
    }

  } catch (err) {
    console.error('❌ Erreur de test:', err.message);
  }
}

testLogin();
