"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Task, User, Module, DashboardStats } from '@/lib/types';
import { CheckCircle, Clock, AlertCircle, Target, TrendingUp, Users, Calendar, Timer, RefreshCw } from 'lucide-react';
import { dashboardService } from '@/lib/dashboard-service';
import { taskService, userService, moduleService } from '@/lib/supabase-services';

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [statsData, tasksData, usersData, modulesData] = await Promise.all([
        dashboardService.getStats(),
        taskService.getAll(),
        userService.getAll(),
        moduleService.getAll()
      ]);
      
      setStats(statsData);
      setTasks(tasksData);
      setUsers(usersData);
      setModules(modulesData);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Erreur lors du chargement des données. Assurez-vous que la base de données Supabase est configurée.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const statusDistribution = useMemo(() => {
    if (!tasks.length) return [];
    
    const statusCount = {
      'todo': 0,
      'in-progress': 0,
      'review': 0,
      'completed': 0
    };

    tasks.forEach(task => {
      statusCount[task.status]++;
    });

    return [
      { name: 'À faire', value: statusCount['todo'], color: '#F59E0B' },
      { name: 'En cours', value: statusCount['in-progress'], color: '#3B82F6' },
      { name: 'En révision', value: statusCount['review'], color: '#8B5CF6' },
      { name: 'Terminé', value: statusCount['completed'], color: '#10B981' }
    ];
  }, [tasks]);

  const moduleStats = useMemo(() => {
    if (!tasks.length || !modules.length) return [];
    
    return modules.map(module => {
      const moduleTasks = tasks.filter(t => t.moduleId === module.id);
      const completedTasks = moduleTasks.filter(t => t.status === 'completed');
      const completion = moduleTasks.length > 0 ? (completedTasks.length / moduleTasks.length) * 100 : 0;
      
      return {
        name: module.name,
        tasks: moduleTasks.length,
        completed: completedTasks.length,
        completion,
        color: module.color
      };
    });
  }, [tasks, modules]);

  const userWorkload = useMemo(() => {
    if (!tasks.length || !users.length) return [];
    
    return users.map(user => {
      const userTasks = tasks.filter(t => t.assignedTo === user.id);
      const completedTasks = userTasks.filter(t => t.status === 'completed');
      
      return {
        name: user.name,
        tasks: userTasks.length,
        completed: completedTasks.length,
        efficiency: userTasks.length > 0 ? (completedTasks.length / userTasks.length) * 100 : 0
      };
    });
  }, [tasks, users]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Chargement des données...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <div>
                <h3 className="font-medium">Erreur de connexion</h3>
                <p className="text-sm text-red-500 mt-1">{error}</p>
                <Button 
                  onClick={loadData} 
                  variant="outline" 
                  size="sm" 
                  className="mt-3"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Réessayer
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
        <Button onClick={loadData} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
      </div>

      {/* Statistiques principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tâches totales</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTasks}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.completedTasks} terminées
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En cours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgressTasks}</div>
            <p className="text-xs text-muted-foreground">
              Tâches actives
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de completion</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}%
            </div>
            <Progress 
              value={stats.totalTasks > 0 ? (stats.completedTasks / stats.totalTasks) * 100 : 0} 
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En retard</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overdueTasks}</div>
            <p className="text-xs text-muted-foreground">
              Tâches urgentes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Temps et efficacité */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Timer className="h-5 w-5 mr-2" />
              Temps de travail
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm">
                  <span>Temps estimé</span>
                  <span>{stats.totalEstimatedTime}h</span>
                </div>
                <Progress value={100} className="mt-1" />
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span>Temps réel</span>
                  <span>{stats.totalActualTime}h</span>
                </div>
                <Progress 
                  value={stats.totalEstimatedTime > 0 ? (stats.totalActualTime / stats.totalEstimatedTime) * 100 : 0} 
                  className="mt-1" 
                />
              </div>
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Efficacité</span>
                  <Badge variant={stats.efficiency >= 90 ? "default" : stats.efficiency >= 70 ? "secondary" : "destructive"}>
                    {stats.efficiency.toFixed(1)}%
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Répartition par statut
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {statusDistribution.map((status) => (
                <div key={status.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: status.color }}
                    />
                    <span className="text-sm">{status.name}</span>
                  </div>
                  <span className="text-sm font-medium">{status.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modules et équipe */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Progression par module</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {moduleStats.map((module) => (
                <div key={module.name} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: module.color }}
                      />
                      <span className="text-sm font-medium">{module.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {module.completed}/{module.tasks}
                    </span>
                  </div>
                  <Progress value={module.completion} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Charge de travail équipe
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userWorkload.map((user) => (
                <div key={user.name} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">{user.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {user.completed}/{user.tasks}
                      </span>
                    </div>
                    <Progress value={user.efficiency} className="h-2" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
