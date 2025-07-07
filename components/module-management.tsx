"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Module } from '@/lib/types';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const moduleSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  description: z.string().min(1, 'La description est requise'),
  color: z.string().min(1, 'La couleur est requise'),
});

interface ModuleManagementProps {
  modules: Module[];
  onCreateModule: (module: Partial<Module>) => void;
  onUpdateModule: (id: string, updates: Partial<Module>) => void;
  onDeleteModule: (id: string) => void;
}

const predefinedColors = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
  '#8B5CF6', '#06B6D4', '#F97316', '#84CC16',
  '#EC4899', '#6366F1', '#14B8A6', '#F59E0B'
];

export function ModuleManagement({ modules, onCreateModule, onUpdateModule, onDeleteModule }: ModuleManagementProps) {
  const [open, setOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);

  const form = useForm<z.infer<typeof moduleSchema>>({
    resolver: zodResolver(moduleSchema),
    defaultValues: {
      name: '',
      description: '',
      color: predefinedColors[0],
    },
  });

  const handleSubmit = (data: z.infer<typeof moduleSchema>) => {
    if (editingModule) {
      onUpdateModule(editingModule.id, data);
    } else {
      onCreateModule(data);
    }
    setOpen(false);
    setEditingModule(null);
    form.reset();
  };

  const handleEdit = (module: Module) => {
    setEditingModule(module);
    form.reset({
      name: module.name,
      description: module.description,
      color: module.color,
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingModule(null);
    form.reset();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl font-bold">Gestion des modules</CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nouveau module
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingModule ? 'Modifier le module' : 'Créer un nouveau module'}
                </DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom du module</FormLabel>
                        <FormControl>
                          <Input placeholder="Nom du module" {...field} />
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
                          <Textarea placeholder="Description du module" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Couleur</FormLabel>
                        <FormControl>
                          <div className="flex space-x-2">
                            {predefinedColors.map((color) => (
                              <button
                                key={color}
                                type="button"
                                className={`w-8 h-8 rounded-full border-2 ${
                                  field.value === color ? 'border-black' : 'border-gray-300'
                                }`}
                                style={{ backgroundColor: color }}
                                onClick={() => field.onChange(color)}
                              />
                            ))}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={handleClose}>
                      Annuler
                    </Button>
                    <Button type="submit">
                      {editingModule ? 'Mettre à jour' : 'Créer'}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((module) => (
            <Card key={module.id} className="border-l-4" style={{ borderLeftColor: module.color }}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-2">
                    <Package className="w-5 h-5" style={{ color: module.color }} />
                    <CardTitle className="text-lg">{module.name}</CardTitle>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(module)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Supprimer le module</AlertDialogTitle>
                          <AlertDialogDescription>
                            Êtes-vous sûr de vouloir supprimer ce module ? Cette action est irréversible.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onDeleteModule(module.id)}>
                            Supprimer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">{module.description}</p>
                <div className="flex justify-between items-center">
                  <Badge style={{ backgroundColor: module.color + '20', color: module.color }}>
                    {module.color}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {module.createdAt.toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}