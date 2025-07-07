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
  const handleCreateUser = (userData: Partial<User>) => {
    const newUser: User = {
      id: Date.now().toString(),
      name: userData.name || '',
      email: userData.email || '',
      role: userData.role || 'developer',
      createdAt: new Date(),
    };
    setUsers([...users, newUser]);
  };

  const handleUpdateUser = (id: string, updates: Partial<User>) => {
    setUsers(users.map(user => 
      user.id === id ? { ...user, ...updates } : user
    ));
  };

  const handleDeleteUser = (id: string) => {
    setUsers(users.filter(user => user.id !== id));
  };

  // Module Management
  const handleCreateModule = (moduleData: Partial<Module>) => {
    const newModule: Module = {
      id: Date.now().toString(),
      name: moduleData.name || '',
      description: moduleData.description || '',
      color: moduleData.color || '#3B82F6',
      createdAt: new Date(),
    };
    setModules([...modules, newModule]);
  };

  const handleUpdateModule = (id: string, updates: Partial<Module>) => {
    setModules(modules.map(module => 
      module.id === id ? { ...module, ...updates } : module
    ));
  };

  const handleDeleteModule = (id: string) => {
    setModules(modules.filter(module => module.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center space-x-3">
            <CheckSquare className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Gestion de Projets</h1>
          </div>
          <p className="text-gray-600 mt-2">
            Gérez efficacement vos tâches, équipes et modules de développement
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Dashboard</span>
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

          <TabsContent value="dashboard" className="space-y-6">
            <Dashboard tasks={tasks} users={users} modules={modules} />
          </TabsContent>

          <TabsContent value="tasks" className="space-y-6">
            <TaskTable
              tasks={tasks}
              users={users}
              modules={modules}
              onCreateTask={handleCreateTask}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
            />
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <UserManagement
              users={users}
              onCreateUser={handleCreateUser}
              onUpdateUser={handleUpdateUser}
              onDeleteUser={handleDeleteUser}
            />
          </TabsContent>

          <TabsContent value="modules" className="space-y-6">
            <ModuleManagement
              modules={modules}
              onCreateModule={handleCreateModule}
              onUpdateModule={handleUpdateModule}
              onDeleteModule={handleDeleteModule}
            />
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Calendrier</h3>
              <p className="text-gray-600">
                Fonctionnalité de calendrier à venir pour la visualisation des échéances
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}