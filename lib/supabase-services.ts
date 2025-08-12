import { supabase } from './supabase';
import { 
  User, 
  Task, 
  Module, 
  Comment, 
  Subtask,
  SupabaseUser, 
  SupabaseTask, 
  SupabaseModule, 
  SupabaseComment,
  SupabaseSubtask
} from './types';

// Fonctions utilitaires pour convertir entre snake_case et camelCase
const convertSupabaseUser = (user: SupabaseUser): User => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  status: user.status,
  avatar: user.avatar || undefined, // Gérer le cas où avatar est null/undefined
  createdAt: new Date(user.created_at)
});

const convertSupabaseModule = (module: SupabaseModule): Module => ({
  id: module.id,
  name: module.name,
  description: module.description,
  color: module.color,
  createdAt: new Date(module.created_at)
});

const convertSupabaseTask = (task: SupabaseTask): Task => ({
  id: task.id,
  title: task.title,
  description: task.description,
  assignedTo: task.assigned_to,
  moduleId: task.module_id,
  status: task.status,
  priority: task.priority,
  estimatedTime: task.estimated_time,
  actualTime: task.actual_time,
  dueDate: task.due_date ? new Date(task.due_date) : undefined,
  createdAt: new Date(task.created_at),
  updatedAt: new Date(task.updated_at)
});

const convertSupabaseComment = (comment: SupabaseComment): Comment => ({
  id: comment.id,
  text: comment.text,
  authorId: comment.author_id,
  taskId: comment.task_id,
  createdAt: new Date(comment.created_at)
});

const convertSupabaseSubtask = (subtask: SupabaseSubtask): Subtask => ({
  id: subtask.id,
  title: subtask.title,
  description: subtask.description,
  status: subtask.status,
  taskId: subtask.task_id,
  createdAt: new Date(subtask.created_at),
  updatedAt: new Date(subtask.updated_at)
});

// Users
export const userService = {
  async getAll(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
    
    return data.map(convertSupabaseUser);
  },

  async getById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return null; // User not found
      }
      console.error('Error fetching user:', error);
      throw error;
    }
    
    return convertSupabaseUser(data);
  },

  async create(userData: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    // Préparer les données sans avatar en premier
    const insertData: any = {
      name: userData.name,
      email: userData.email,
      role: userData.role
    };
    
    // Ajouter avatar seulement s'il est fourni
    if (userData.avatar) {
      insertData.avatar = userData.avatar;
    }

    const { data, error } = await supabase
      .from('users')
      .insert([insertData])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating user:', error);
      throw error;
    }
    
    return convertSupabaseUser(data);
  },

  async update(id: string, updates: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating user:', error);
      throw error;
    }
    
    return convertSupabaseUser(data);
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
};

// Modules
export const moduleService = {
  async getAll(): Promise<Module[]> {
    const { data, error } = await supabase
      .from('modules')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching modules:', error);
      throw error;
    }
    
    return data.map(convertSupabaseModule);
  },

  async getById(id: string): Promise<Module | null> {
    const { data, error } = await supabase
      .from('modules')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error fetching module:', error);
      throw error;
    }
    
    return convertSupabaseModule(data);
  },

  async create(moduleData: Omit<Module, 'id' | 'createdAt'>): Promise<Module> {
    const { data, error } = await supabase
      .from('modules')
      .insert([{
        name: moduleData.name,
        description: moduleData.description,
        color: moduleData.color
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating module:', error);
      throw error;
    }
    
    return convertSupabaseModule(data);
  },

  async update(id: string, updates: Partial<Omit<Module, 'id' | 'createdAt'>>): Promise<Module> {
    const { data, error } = await supabase
      .from('modules')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating module:', error);
      throw error;
    }
    
    return convertSupabaseModule(data);
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase
      .from('modules')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting module:', error);
      throw error;
    }
  }
};

// Tasks
export const taskService = {
  async getAll(): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
    
    return data.map(convertSupabaseTask);
  },

  async getById(id: string): Promise<Task | null> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error fetching task:', error);
      throw error;
    }
    
    return convertSupabaseTask(data);
  },

  async getByModule(moduleId: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('module_id', moduleId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching tasks by module:', error);
      throw error;
    }
    
    return data.map(convertSupabaseTask);
  },

  async getByAssignedUser(userId: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('assigned_to', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching tasks by user:', error);
      throw error;
    }
    
    return data.map(convertSupabaseTask);
  },

  async create(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .insert([{
        title: taskData.title,
        description: taskData.description,
        assigned_to: taskData.assignedTo,
        module_id: taskData.moduleId,
        status: taskData.status,
        priority: taskData.priority,
        estimated_time: taskData.estimatedTime,
        actual_time: taskData.actualTime || 0,
        due_date: taskData.dueDate?.toISOString()
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating task:', error);
      throw error;
    }
    
    return convertSupabaseTask(data);
  },

  async update(id: string, updates: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Task> {
    const updateData: any = {};
    
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.assignedTo !== undefined) updateData.assigned_to = updates.assignedTo;
    if (updates.moduleId !== undefined) updateData.module_id = updates.moduleId;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.priority !== undefined) updateData.priority = updates.priority;
    if (updates.estimatedTime !== undefined) updateData.estimated_time = updates.estimatedTime;
    if (updates.actualTime !== undefined) updateData.actual_time = updates.actualTime;
    if (updates.dueDate !== undefined) updateData.due_date = updates.dueDate?.toISOString();

    const { data, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating task:', error);
      throw error;
    }
    
    return convertSupabaseTask(data);
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  },

  async clearAll(): Promise<void> {
    // Suppression des tâches
    const { error: taskError } = await supabase
      .from('tasks')
      .delete(); // Suppression globale sans clause WHERE

    if (taskError) {
      console.error('Error clearing all tasks:', taskError);
      throw taskError;
    }

    // Suppression des sous-tâches
    const { error: subtaskError } = await supabase
      .from('subtasks')
      .delete();

    if (subtaskError) {
      console.error('Error clearing all subtasks:', subtaskError);
      throw subtaskError;
    }

    // Suppression des commentaires
    const { error: commentError } = await supabase
      .from('comments')
      .delete();

    if (commentError) {
      console.error('Error clearing all comments:', commentError);
      throw commentError;
    }
  }
};

// Comments
export const commentService = {
  async getByTask(taskId: string): Promise<Comment[]> {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }
    
    return data.map(convertSupabaseComment);
  },

  async create(commentData: Omit<Comment, 'id' | 'createdAt'>): Promise<Comment> {
    const { data, error } = await supabase
      .from('comments')
      .insert([{
        text: commentData.text,
        author_id: commentData.authorId,
        task_id: commentData.taskId
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating comment:', error);
      throw error;
    }
    
    return convertSupabaseComment(data);
  },

  async update(id: string, text: string): Promise<Comment> {
    const { data, error } = await supabase
      .from('comments')
      .update({ text })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating comment:', error);
      throw error;
    }
    
    return convertSupabaseComment(data);
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  }
};

// Subtasks
export const subtaskService = {
  async getByTask(taskId: string): Promise<Subtask[]> {
    const { data, error } = await supabase
      .from('subtasks')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching subtasks:', error);
      throw error;
    }

    return data.map(convertSupabaseSubtask);
  },

  async create(subtaskData: Omit<Subtask, 'id' | 'createdAt' | 'updatedAt'>): Promise<Subtask> {
    const { data, error } = await supabase
      .from('subtasks')
      .insert([{
        title: subtaskData.title,
        description: subtaskData.description,
        status: subtaskData.status,
        task_id: subtaskData.taskId
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating subtask:', error);
      throw error;
    }

    return convertSupabaseSubtask(data);
  },

  async update(id: string, updates: Partial<Omit<Subtask, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Subtask> {
    const { data, error } = await supabase
      .from('subtasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating subtask:', error);
      throw error;
    }

    return convertSupabaseSubtask(data);
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase
      .from('subtasks')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting subtask:', error);
      throw error;
    }
  }
};
