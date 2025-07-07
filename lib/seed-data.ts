import { userService, moduleService, taskService, commentService } from './supabase-services';
import { supabase } from './supabase';

// Données d'exemple pour tester l'application
export const seedData = {
  users: [
    {
      name: 'Alice Martin',
      email: 'alice@example.com',
      role: 'admin' as const,
      avatar: 'https://ui-avatars.com/api/?name=Alice+Martin&background=6366f1&color=fff'
    },
    {
      name: 'Bob Dupont',
      email: 'bob@example.com',
      role: 'developer' as const,
      avatar: 'https://ui-avatars.com/api/?name=Bob+Dupont&background=8b5cf6&color=fff'
    },
    {
      name: 'Clara Rousseau',
      email: 'clara@example.com',
      role: 'designer' as const,
      avatar: 'https://ui-avatars.com/api/?name=Clara+Rousseau&background=ec4899&color=fff'
    },
    {
      name: 'David Leroy',
      email: 'david@example.com',
      role: 'manager' as const,
      avatar: 'https://ui-avatars.com/api/?name=David+Leroy&background=10b981&color=fff'
    }
  ],
  
  modules: [
    {
      name: 'Frontend',
      description: 'Interface utilisateur et expérience utilisateur',
      color: '#3b82f6'
    },
    {
      name: 'Backend',
      description: 'API et logique métier',
      color: '#10b981'
    },
    {
      name: 'Mobile',
      description: 'Application mobile native',
      color: '#f59e0b'
    },
    {
      name: 'DevOps',
      description: 'Infrastructure et déploiement',
      color: '#ef4444'
    }
  ]
};

export async function seedDatabase() {
  try {
    console.log('🌱 Seeding database...');
    
    // Créer les utilisateurs
    const createdUsers = [];
    for (const user of seedData.users) {
      try {
        const createdUser = await userService.create(user);
        createdUsers.push(createdUser);
        console.log(`✅ User created: ${createdUser.name}`);
      } catch (error) {
        console.log(`⚠️ User ${user.name} might already exist`);
      }
    }
    
    // Créer les modules
    const createdModules = [];
    for (const module of seedData.modules) {
      try {
        const createdModule = await moduleService.create(module);
        createdModules.push(createdModule);
        console.log(`✅ Module created: ${createdModule.name}`);
      } catch (error) {
        console.log(`⚠️ Module ${module.name} might already exist`);
      }
    }
    
    // Récupérer tous les utilisateurs et modules pour créer des tâches
    const allUsers = await userService.getAll();
    const allModules = await moduleService.getAll();
    
    if (allUsers.length > 0 && allModules.length > 0) {
      // Créer quelques tâches d'exemple
      const sampleTasks = [
        {
          title: 'Créer la page d\'accueil',
          description: 'Développer la page d\'accueil avec les dernières statistiques',
          assignedTo: allUsers[0].id,
          moduleId: allModules[0].id, // Frontend
          status: 'in-progress' as const,
          priority: 'high' as const,
          estimatedTime: 8,
          actualTime: 6,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Dans 7 jours
        },
        {
          title: 'API d\'authentification',
          description: 'Implémenter l\'API pour l\'authentification des utilisateurs',
          assignedTo: allUsers[1].id,
          moduleId: allModules[1].id, // Backend
          status: 'completed' as const,
          priority: 'urgent' as const,
          estimatedTime: 12,
          actualTime: 10
        },
        {
          title: 'Design du logo',
          description: 'Créer un nouveau logo pour l\'application',
          assignedTo: allUsers[2].id,
          moduleId: allModules[0].id, // Frontend
          status: 'review' as const,
          priority: 'medium' as const,
          estimatedTime: 4,
          actualTime: 5
        },
        {
          title: 'Configuration CI/CD',
          description: 'Mettre en place les pipelines de déploiement automatique',
          assignedTo: allUsers[3].id,
          moduleId: allModules[3].id, // DevOps
          status: 'todo' as const,
          priority: 'low' as const,
          estimatedTime: 16,
          actualTime: 0,
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // Dans 14 jours
        }
      ];
      
      for (const task of sampleTasks) {
        try {
          const createdTask = await taskService.create(task);
          console.log(`✅ Task created: ${createdTask.title}`);
          
          // Ajouter un commentaire d'exemple
          if (Math.random() > 0.5) {
            await commentService.create({
              text: 'Tâche créée automatiquement lors de l\'initialisation.',
              authorId: task.assignedTo!,
              taskId: createdTask.id
            });
          }
        } catch (error) {
          console.log(`⚠️ Task ${task.title} might already exist`);
        }
      }
    }
    
    console.log('🎉 Database seeded successfully!');
    return { success: true };
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    return { success: false, error };
  }
}

// Fonction pour nettoyer la base de données (utile pour les tests)
export async function clearDatabase() {
  try {
    console.log('🧹 Clearing database...');
    
    // Supprimer dans l'ordre inverse des dépendances
    const { error: commentsError } = await supabase.from('comments').delete().neq('id', '');
    const { error: tasksError } = await supabase.from('tasks').delete().neq('id', '');
    const { error: modulesError } = await supabase.from('modules').delete().neq('id', '');
    const { error: usersError } = await supabase.from('users').delete().neq('id', '');
    
    if (commentsError || tasksError || modulesError || usersError) {
      throw new Error('Error clearing database');
    }
    
    console.log('✅ Database cleared successfully!');
    return { success: true };
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    return { success: false, error };
  }
}
