export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'developer' | 'designer';
  avatar?: string;
  status: 'active' | 'inactive' | 'suspended';
  lastLogin?: Date;
  passwordChangedAt?: Date;
  createdAt: Date;
}

export interface AuthUser extends User {
  password?: string;
  isActive: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role?: 'manager' | 'developer' | 'designer';
}

export interface UserRequest {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'developer' | 'designer';
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  rejectionReason?: string;
}

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface Module {
  id: string;
  name: string;
  description: string;
  color: string;
  createdAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  assignedTo?: string; // User ID, optionnel car peut être null
  moduleId: string;
  status: 'todo' | 'in-progress' | 'review' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedTime: number; // en heures
  actualTime: number; // en heures
  comments?: Comment[]; // Optionnel car chargé séparément
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
}

export interface Comment {
  id: string;
  text: string;
  authorId: string;
  taskId: string; // Ajout de la référence à la tâche
  createdAt: Date;
}

export interface Subtask {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'completed';
  taskId: string; // Référence à la tâche principale
  createdAt: Date;
  updatedAt: Date;
}

// Types pour les données brutes de Supabase (snake_case)
export interface SupabaseUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'developer' | 'designer';
  status: 'active' | 'inactive' | 'suspended';
  avatar?: string;
  created_at: string;
}

export interface SupabaseModule {
  id: string;
  name: string;
  description: string;
  color: string;
  created_at: string;
}

export interface SupabaseTask {
  id: string;
  title: string;
  description?: string;
  assigned_to?: string;
  module_id: string;
  status: 'todo' | 'in-progress' | 'review' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimated_time: number;
  actual_time: number;
  due_date?: string;
  created_at: string;
  updated_at: string;
}

export interface SupabaseComment {
  id: string;
  text: string;
  author_id: string;
  task_id: string;
  created_at: string;
}

export interface SupabaseSubtask {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'completed';
  task_id: string; // Référence à la tâche principale
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  totalEstimatedTime: number;
  totalActualTime: number;
  efficiency: number;
}