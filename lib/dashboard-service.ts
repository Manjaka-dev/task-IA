import { supabase } from './supabase';
import { DashboardStats } from './types';

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    try {
      // Récupérer toutes les tâches
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('status, estimated_time, actual_time, due_date');

      if (tasksError) {
        console.error('Error fetching tasks for stats:', tasksError);
        throw tasksError;
      }

      const totalTasks = tasks.length;
      const completedTasks = tasks.filter(task => task.status === 'completed').length;
      const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length;
      
      // Calculer les tâches en retard
      const now = new Date();
      const overdueTasks = tasks.filter(task => {
        if (!task.due_date) return false;
        const dueDate = new Date(task.due_date);
        return dueDate < now && task.status !== 'completed';
      }).length;

      // Calculer les temps totaux
      const totalEstimatedTime = tasks.reduce((sum, task) => sum + (task.estimated_time || 0), 0);
      const totalActualTime = tasks.reduce((sum, task) => sum + (task.actual_time || 0), 0);

      // Calculer l'efficacité (ratio temps estimé / temps réel)
      const efficiency = totalEstimatedTime > 0 ? (totalEstimatedTime / totalActualTime) * 100 : 0;

      return {
        totalTasks,
        completedTasks,
        inProgressTasks,
        overdueTasks,
        totalEstimatedTime,
        totalActualTime,
        efficiency: Math.round(efficiency * 100) / 100 // Arrondir à 2 décimales
      };
    } catch (error) {
      console.error('Error calculating dashboard stats:', error);
      throw error;
    }
  },

  async getTasksByStatus(): Promise<Record<string, number>> {
    try {
      const { data: tasks, error } = await supabase
        .from('tasks')
        .select('status');

      if (error) {
        console.error('Error fetching tasks by status:', error);
        throw error;
      }

      const statusCounts = tasks.reduce((acc, task) => {
        acc[task.status] = (acc[task.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return statusCounts;
    } catch (error) {
      console.error('Error getting tasks by status:', error);
      throw error;
    }
  },

  async getTasksByPriority(): Promise<Record<string, number>> {
    try {
      const { data: tasks, error } = await supabase
        .from('tasks')
        .select('priority');

      if (error) {
        console.error('Error fetching tasks by priority:', error);
        throw error;
      }

      const priorityCounts = tasks.reduce((acc, task) => {
        acc[task.priority] = (acc[task.priority] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return priorityCounts;
    } catch (error) {
      console.error('Error getting tasks by priority:', error);
      throw error;
    }
  },

  async getRecentTasks(limit: number = 5): Promise<any[]> {
    try {
      const { data: tasks, error } = await supabase
        .from('tasks')
        .select(`
          id,
          title,
          status,
          priority,
          created_at,
          assigned_to,
          users(name)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching recent tasks:', error);
        throw error;
      }

      return tasks.map(task => ({
        id: task.id,
        title: task.title,
        status: task.status,
        priority: task.priority,
        createdAt: new Date(task.created_at),
        assignedToName: (task.users as any)?.name || 'Non assigné'
      }));
    } catch (error) {
      console.error('Error getting recent tasks:', error);
      throw error;
    }
  }
};
