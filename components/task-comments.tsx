"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Comment, Task, User } from '@/lib/types';
import { commentService } from '@/lib/supabase-services';
import { MessageSquare, Send, Trash2 } from 'lucide-react';

const commentSchema = z.object({
  text: z.string().min(1, 'Le commentaire ne peut pas être vide'),
});

interface TaskCommentsProps {
  task: Task;
  users: User[];
  currentUserId: string;
}

export function TaskComments({ task, users, currentUserId }: TaskCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof commentSchema>>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      text: '',
    },
  });

  const loadComments = async () => {
    try {
      setLoading(true);
      const taskComments = await commentService.getByTask(task.id);
      setComments(taskComments);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadComments();
    }
  }, [open, task.id]);

  const handleSubmit = async (data: z.infer<typeof commentSchema>) => {
    try {
      setSubmitting(true);
      const newComment = await commentService.create({
        text: data.text,
        authorId: currentUserId,
        taskId: task.id,
      });
      setComments(prev => [...prev, newComment]);
      form.reset();
    } catch (error) {
      console.error('Error creating comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await commentService.remove(commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user?.name || 'Utilisateur inconnu';
  };

  const getUserAvatar = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user?.avatar || user?.name?.charAt(0).toUpperCase() || '?';
  };

  const commentCount = comments.length;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <MessageSquare className="w-4 h-4 mr-2" />
          Commentaires ({commentCount})
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Commentaires - {task.title}</DialogTitle>
          <DialogDescription>
            Ajoutez des commentaires pour suivre les discussions sur cette tâche.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Formulaire d'ajout de commentaire */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ajouter un commentaire</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="text"
                    render={({ field }: { field: any }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            placeholder="Écrivez votre commentaire..."
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={submitting}>
                    <Send className="w-4 h-4 mr-2" />
                    {submitting ? 'Envoi...' : 'Envoyer'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Liste des commentaires */}
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Chargement des commentaires...</p>
              </div>
            ) : comments.length === 0 ? (
              <Card>
                <CardContent className="py-6">
                  <div className="text-center text-gray-500">
                    <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Aucun commentaire pour cette tâche.</p>
                    <p className="text-sm">Soyez le premier à commenter !</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              comments.map((comment) => (
                <Card key={comment.id} className="border-l-4 border-blue-500">
                  <CardContent className="py-3">
                    <div className="flex items-start space-x-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-xs">
                          {getUserAvatar(comment.authorId)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-sm">
                              {getUserName(comment.authorId)}
                            </span>
                            <span className="text-xs text-gray-500">
                              {comment.createdAt.toLocaleString('fr-FR')}
                            </span>
                          </div>
                          {comment.authorId === currentUserId && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteComment(comment.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                        <p className="text-sm mt-1 whitespace-pre-wrap">{comment.text}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
