"use client";

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TaskTable } from '@/components/task-table';
import { Dashboard } from '@/components/dashboard';
import { UserManagement } from '@/components/user-management';
import { ModuleManagement } from '@/components/module-management';
import { Task, User, Module } from '@/lib/types';
import { taskService, userService, moduleService } from '@/lib/supabase-services';
import { seedDatabase } from '@/lib/seed-data';
import { BarChart3, CheckSquare, Users, Package, Calendar, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tasksData, usersData, modulesData] = await Promise.all([
        taskService.getAll(),
        userService.getAll(),
        moduleService.getAll()
      ]);
      setTasks(tasksData);
      setUsers(usersData);
      setModules(modulesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedDatabase = async () => {
    await seedDatabase();
    await loadData();
  };

  // Task Management
  const handleCreateTask = async (taskData: Partial<Task>) => {
    try {
      const newTask = await taskService.create(taskData as Omit<Task, 'id' | 'createdAt' | 'updatedAt'>);
      setTasks(prev => [newTask, ...prev]);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleUpdateTask = async (id: string, updates: Partial<Task>) => {
    try {
      const updatedTask = await taskService.update(id, updates);
      setTasks(prev => prev.map(task => task.id === id ? updatedTask : task));
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await taskService.remove(id);
      setTasks(prev => prev.filter(task => task.id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  // User Management
  const handleCreateUser = async (userData: Partial<User>) => {
    try {
      const newUser = await userService.create(userData as Omit<User, 'id' | 'createdAt'>);
      setUsers(prev => [newUser, ...prev]);
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const handleUpdateUser = async (id: string, updates: Partial<User>) => {
    try {
      const updatedUser = await userService.update(id, updates);
      setUsers(prev => prev.map(user => user.id === id ? updatedUser : user));
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await userService.remove(id);
      setUsers(prev => prev.filter(user => user.id !== id));
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  // Module Management
  const handleCreateModule = async (moduleData: Partial<Module>) => {
    try {
      const newModule = await moduleService.create(moduleData as Omit<Module, 'id' | 'createdAt'>);
      setModules(prev => [newModule, ...prev]);
    } catch (error) {
      console.error('Error creating module:', error);
    }
  };

  const handleUpdateModule = async (id: string, updates: Partial<Module>) => {
    try {
      const updatedModule = await moduleService.update(id, updates);
      setModules(prev => prev.map(module => module.id === id ? updatedModule : module));
    } catch (error) {
      console.error('Error updating module:', error);
    }
  };

  const handleDeleteModule = async (id: string) => {
    try {
      await moduleService.remove(id);
      setModules(prev => prev.filter(module => module.id !== id));
    } catch (error) {
      console.error('Error deleting module:', error);
    }
  };

  const handleTestConnection = async () => {
    try {
      const { testSupabaseConnection } = await import('@/lib/test-connection');
      const { checkDatabaseSchema } = await import('@/lib/check-schema');
      
      console.log('🔍 Tests de connexion et schéma Supabase...');
      const connectionOk = await testSupabaseConnection();
      const schemaOk = await checkDatabaseSchema();
      
      if (connectionOk && schemaOk) {
        console.log('🎉 Tous les tests sont passés !');
      } else {
        console.log('⚠️ Certains tests ont échoué. Voir les détails ci-dessus.');
      }
    } catch (error) {
      console.error('Error testing connection:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CheckSquare className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Gestionnaire de Tâches
                </h1>
                <p className="text-gray-600">
                  Gérez vos projets et tâches avec Supabase
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button onClick={handleTestConnection} variant="outline" size="sm">
                <CheckSquare className="h-4 w-4 mr-2" />
                Tester Supabase
              </Button>
              <Button onClick={loadData} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualiser
              </Button>
              <Button onClick={handleSeedDatabase} variant="secondary" size="sm">
                <Package className="h-4 w-4 mr-2" />
                Initialiser les données
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Tableau de bord</span>
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center space-x-2">
              <CheckSquare className="w-4 h-4" />
              <span>Tâches</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Utilisateurs</span>
            </TabsTrigger>
            <TabsTrigger value="modules" className="flex items-center space-x-2">
              <Package className="w-4 h-4" />
              <span>Modules</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Calendrier</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <Dashboard />
          </TabsContent>

          <TabsContent value="tasks">
            <TaskTable
              tasks={tasks}
              users={users}
              modules={modules}
              onCreateTask={handleCreateTask}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
            />
          </TabsContent>

          <TabsContent value="users">
            <UserManagement
              users={users}
              onCreateUser={handleCreateUser}
              onUpdateUser={handleUpdateUser}
              onDeleteUser={handleDeleteUser}
            />
          </TabsContent>

          <TabsContent value="modules">
            <ModuleManagement
              modules={modules}
              onCreateModule={handleCreateModule}
              onUpdateModule={handleUpdateModule}
              onDeleteModule={handleDeleteModule}
            />
          </TabsContent>

          <TabsContent value="calendar">
            <div className="p-8 text-center">
              <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Vue Calendrier
              </h3>
              <p className="text-gray-600">
                La vue calendrier sera disponible prochainement.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
