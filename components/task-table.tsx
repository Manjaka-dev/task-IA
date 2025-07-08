"use client";

import { useState } from 'react';
import { Task, User, Module } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TaskForm } from './task-form';
import { TaskComments } from './task-comments';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { exportTasksToExcel } from '@/lib/excel-export';
import { Download, Search, Filter, Trash2, Edit } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { taskService } from '@/lib/supabase-services';

interface TaskTableProps {
  tasks: Task[];
  users: User[];
  modules: Module[];
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
  onCreateTask: (task: Partial<Task>) => void;
  currentUserId: string;
}

export function TaskTable({ tasks, users, modules, onUpdateTask, onDeleteTask, onCreateTask, currentUserId }: TaskTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [moduleFilter, setModuleFilter] = useState<string>('all');

  const getUserName = (userId: string) => 
    users.find(u => u.id === userId)?.name || 'Non assigné';
  
  const getModuleName = (moduleId: string) =>
    modules.find(m => m.id === moduleId)?.name || 'Module inconnu';

  const getModuleColor = (moduleId: string) =>
    modules.find(m => m.id === moduleId)?.color || '#6B7280';

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (task.assignedTo ? getUserName(task.assignedTo).toLowerCase().includes(searchTerm.toLowerCase()) : false);
    
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    const matchesModule = moduleFilter === 'all' || task.moduleId === moduleFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesModule;
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      'todo': 'secondary',
      'in-progress': 'default',
      'review': 'outline',
      'completed': 'default'
    } as const;

    const colors = {
      'todo': 'bg-slate-100 text-slate-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      'review': 'bg-yellow-100 text-yellow-800',
      'completed': 'bg-green-100 text-green-800'
    };

    const labels = {
      'todo': 'À faire',
      'in-progress': 'En cours',
      'review': 'En révision',
      'completed': 'Terminé'
    };

    return (
      <Badge className={colors[status as keyof typeof colors]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      'low': 'bg-green-100 text-green-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'high': 'bg-orange-100 text-orange-800',
      'urgent': 'bg-red-100 text-red-800'
    };

    const labels = {
      'low': 'Faible',
      'medium': 'Moyenne',
      'high': 'Élevée',
      'urgent': 'Urgente'
    };

    return (
      <Badge className={colors[priority as keyof typeof colors]}>
        {labels[priority as keyof typeof labels]}
      </Badge>
    );
  };

  const handleExport = () => {
    exportTasksToExcel(filteredTasks, users, modules);
  };

  const handleResetTasks = async () => {
    try {
      await taskService.clearAll();
      alert('Toutes les tâches ont été supprimées avec succès.');
    } catch (error) {
      console.error('Erreur lors de la réinitialisation des tâches:', error);
      alert('Une erreur est survenue lors de la réinitialisation des tâches.');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl font-bold">Gestion des tâches</CardTitle>
          <div className="flex space-x-2">
            <Button onClick={handleResetTasks} variant="outline" size="sm">
              Réinitialiser les tâches
            </Button>
            <Button onClick={handleExport} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export Excel
            </Button>
            <TaskForm
              users={users}
              modules={modules}
              onSubmit={(data) => onCreateTask(data)}
            />
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4 mt-4">
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-gray-500" />
            <Input
              placeholder="Rechercher une tâche..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="todo">À faire</SelectItem>
              <SelectItem value="in-progress">En cours</SelectItem>
              <SelectItem value="review">En révision</SelectItem>
              <SelectItem value="completed">Terminé</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Priorité" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes priorités</SelectItem>
              <SelectItem value="low">Faible</SelectItem>
              <SelectItem value="medium">Moyenne</SelectItem>
              <SelectItem value="high">Élevée</SelectItem>
              <SelectItem value="urgent">Urgente</SelectItem>
            </SelectContent>
          </Select>

          <Select value={moduleFilter} onValueChange={setModuleFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Module" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les modules</SelectItem>
              {modules.map(module => (
                <SelectItem key={module.id} value={module.id}>
                  {module.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-64">Tâche</TableHead>
                <TableHead className="w-40">Assigné à</TableHead>
                <TableHead className="w-32">Module</TableHead>
                <TableHead className="w-32">Statut</TableHead>
                <TableHead className="w-32">Priorité</TableHead>
                <TableHead className="w-24">Temps prévu</TableHead>
                <TableHead className="w-24">Temps pris</TableHead>
                <TableHead className="w-24">Écart</TableHead>
                <TableHead className="w-20">Commentaires</TableHead>
                <TableHead className="w-32">Date limite</TableHead>
                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{task.title}</div>
                      {task.description && (
                        <div className="text-sm text-gray-500 mt-1">
                          {task.description.substring(0, 50)}
                          {task.description.length > 50 && '...'}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={task.assignedTo}
                      onValueChange={(newAssignedTo) => onUpdateTask(task.id, { assignedTo: newAssignedTo })}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Assigné à" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map(user => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      style={{ backgroundColor: getModuleColor(task.moduleId) + '20', color: getModuleColor(task.moduleId) }}
                    >
                      {getModuleName(task.moduleId)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={task.status}
                      onValueChange={(newStatus: 'todo' | 'in-progress' | 'review' | 'completed') => onUpdateTask(task.id, { status: newStatus })}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Statut" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todo">À faire</SelectItem>
                        <SelectItem value="in-progress">En cours</SelectItem>
                        <SelectItem value="review">En révision</SelectItem>
                        <SelectItem value="completed">Terminé</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                  <TableCell>
                    <span className="text-sm">{task.estimatedTime}h</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{task.actualTime}h</span>
                  </TableCell>
                  <TableCell>
                    <span className={`text-sm font-medium ${
                      task.actualTime > task.estimatedTime ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {task.actualTime > task.estimatedTime ? '+' : ''}
                      {task.actualTime - task.estimatedTime}h
                    </span>
                  </TableCell>
                  <TableCell>
                    <TaskComments
                      task={task}
                      users={users}
                      currentUserId={currentUserId}
                    />
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {task.dueDate ? task.dueDate.toLocaleDateString('fr-FR') : '-'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <TaskForm
                        task={task}
                        users={users}
                        modules={modules}
                        onSubmit={(data) => onUpdateTask(task.id, data)}
                        trigger={
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        }
                      />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Supprimer la tâche</AlertDialogTitle>
                            <AlertDialogDescription>
                              Êtes-vous sûr de vouloir supprimer cette tâche ? Cette action est irréversible.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onDeleteTask(task.id)}>
                              Supprimer
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}