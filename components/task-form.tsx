"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Task, User, Module, Subtask } from '@/lib/types';
import { Plus, Edit } from 'lucide-react';
import { subtaskService } from '@/lib/supabase-services';

const taskSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  description: z.string().optional(),
  assignedTo: z.string().min(1, 'L\'assignation est requise'),
  moduleId: z.string().min(1, 'Le module est requis'),
  status: z.enum(['todo', 'in-progress', 'review', 'completed']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  estimatedTime: z.number().min(0, 'Le temps doit être positif'),
  dueDate: z.string().optional(),
});

interface TaskFormProps {
  task?: Task;
  users: User[];
  modules: Module[];
  onSubmit: (data: Partial<Task>) => void;
  trigger?: React.ReactNode;
}

export function TaskForm({ task, users, modules, onSubmit, trigger }: TaskFormProps) {
  const [open, setOpen] = useState(false);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  
  const form = useForm<z.infer<typeof taskSchema>>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task?.title || '',
      description: task?.description || '',
      assignedTo: task?.assignedTo || '',
      moduleId: task?.moduleId || '',
      status: task?.status || 'todo',
      priority: task?.priority || 'medium',
      estimatedTime: task?.estimatedTime || 0,
      dueDate: task?.dueDate?.toISOString().split('T')[0] || '',
    },
  });

  useEffect(() => {
    if (task?.id) {
      subtaskService.getByTask(task.id).then(setSubtasks).catch(console.error);
    }
  }, [task?.id]);

  const handleSubmit = (data: z.infer<typeof taskSchema>) => {
    const taskData = {
      title: data.title,
      description: data.description || '',
      assignedTo: data.assignedTo,
      moduleId: data.moduleId,
      status: data.status,
      priority: data.priority,
      estimatedTime: data.estimatedTime,
      actualTime: 0, // Valeur par défaut pour actual_time
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
    };
    
    onSubmit(taskData);
    setOpen(false);
    form.reset();
  };

  const handleAddSubtask = async (title: string) => {
    try {
      const newSubtask = await subtaskService.create({
        title,
        taskId: task?.id || '',
        status: 'todo'
      });
      setSubtasks((prev) => [...prev, newSubtask]);
    } catch (error) {
      console.error('Error adding subtask:', error);
    }
  };

  const handleUpdateSubtask = async (id: string, updates: Partial<Subtask>) => {
    try {
      const updatedSubtask = await subtaskService.update(id, updates);
      setSubtasks((prev) => prev.map((subtask) => (subtask.id === id ? updatedSubtask : subtask)));
    } catch (error) {
      console.error('Error updating subtask:', error);
    }
  };

  const handleRemoveSubtask = async (id: string) => {
    try {
      await subtaskService.remove(id);
      setSubtasks((prev) => prev.filter((subtask) => subtask.id !== id));
    } catch (error) {
      console.error('Error removing subtask:', error);
    }
  };

  const defaultTrigger = (
    <Button variant="outline" size="sm">
      {task ? <Edit className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
      {task ? 'Modifier' : 'Nouvelle tâche'}
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {task ? 'Modifier la tâche' : 'Créer une nouvelle tâche'}
          </DialogTitle>
          <DialogDescription>
            {task ? 'Modifiez les informations de la tâche ci-dessous.' : 'Remplissez les informations pour créer une nouvelle tâche.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titre</FormLabel>
                  <FormControl>
                    <Input placeholder="Titre de la tâche" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Description détaillée" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="assignedTo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assigné à</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un utilisateur" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {users.map(user => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="moduleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Module</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un module" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {modules.map(module => (
                          <SelectItem key={module.id} value={module.id}>
                            {module.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Statut</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="todo">À faire</SelectItem>
                        <SelectItem value="in-progress">En cours</SelectItem>
                        <SelectItem value="review">En révision</SelectItem>
                        <SelectItem value="completed">Terminé</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priorité</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Faible</SelectItem>
                        <SelectItem value="medium">Moyenne</SelectItem>
                        <SelectItem value="high">Élevée</SelectItem>
                        <SelectItem value="urgent">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="estimatedTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Temps prévu (heures)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        step="0.5"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date limite</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Sous-tâches */}
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Sous-tâches</h3>
              <ul className="space-y-1">
                {subtasks.map((subtask) => (
                  <li key={subtask.id} className="flex items-center space-x-2">
                    <Input
                      value={subtask.title}
                      onChange={(e) => handleUpdateSubtask(subtask.id, { title: e.target.value })}
                      className="flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveSubtask(subtask.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Supprimer
                    </Button>
                  </li>
                ))}
              </ul>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddSubtask('Nouvelle sous-tâche')}
              >
                Ajouter une sous-tâche
              </Button>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Annuler
              </Button>
              <Button type="submit">
                {task ? 'Mettre à jour' : 'Créer'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}