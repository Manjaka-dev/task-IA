'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Shield, User, Mail, Calendar, Check, X, Ban } from 'lucide-react';
import { authService } from '@/lib/auth-service';
import { User as UserType } from '@/lib/types';
import { formatDate, getInitials, getRoleColor } from '@/lib/utils';

export default function AdminUsersPage() {
  const { isAdmin, loading, userProfile } = useAuth();
  const [users, setUsers] = useState<UserType[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
    }
  }, [isAdmin]);

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      const data = await authService.getAllUsers();
      setUsers(data);
    } catch (error: any) {
      setError(error.message || 'Erreur lors du chargement des utilisateurs');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    try {
      setActionLoading(userId);
      const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
      await authService.toggleUserStatus(userId, newStatus);
      await loadUsers(); // Recharger la liste
    } catch (error: any) {
      setError(error.message || 'Erreur lors de la modification du statut');
    } finally {
      setActionLoading(null);
    }
  };

  const getRoleLabel = (role: string) => {
    const labels = {
      admin: 'Administrateur',
      manager: 'Manager',
      developer: 'Développeur',
      designer: 'Designer',
    };
    return labels[role as keyof typeof labels] || role;
  };

  const getStatusBadge = (status: string) => {
    if (status === 'active') {
      return <Badge className="bg-green-100 text-green-800">Actif</Badge>;
    } else if (status === 'suspended') {
      return <Badge className="bg-red-100 text-red-800">Suspendu</Badge>;
    } else {
      return <Badge className="bg-gray-100 text-gray-800">Inactif</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">Chargement...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto py-6">
        <Alert variant="destructive">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Accès refusé. Vous devez être administrateur pour accéder à cette page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gestion des utilisateurs</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Utilisateurs de l'application
          </CardTitle>
          <CardDescription>
            Gérez les utilisateurs et leurs statuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {loadingUsers ? (
            <div className="text-center py-8">Chargement des utilisateurs...</div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Aucun utilisateur trouvé
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Inscrit le</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback>
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        {user.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRoleColor(user.role)}>
                        {getRoleLabel(user.role)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(user.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {formatDate(new Date(user.createdAt))}
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.id !== userProfile?.id && user.role !== 'admin' && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant={user.status === 'active' ? 'destructive' : 'default'}
                              disabled={actionLoading === user.id}
                            >
                              {user.status === 'active' ? (
                                <>
                                  <Ban className="h-4 w-4 mr-1" />
                                  Suspendre
                                </>
                              ) : (
                                <>
                                  <Check className="h-4 w-4 mr-1" />
                                  Réactiver
                                </>
                              )}
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>
                                {user.status === 'active' ? 'Suspendre' : 'Réactiver'} l'utilisateur
                              </DialogTitle>
                              <DialogDescription>
                                Voulez-vous {user.status === 'active' ? 'suspendre' : 'réactiver'}{' '}
                                <strong>{user.name}</strong> ?
                                {user.status === 'active' && (
                                  <span className="block mt-2 text-red-600">
                                    L'utilisateur ne pourra plus se connecter.
                                  </span>
                                )}
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <Button variant="outline">
                                Annuler
                              </Button>
                              <Button
                                variant={user.status === 'active' ? 'destructive' : 'default'}
                                onClick={() => handleToggleUserStatus(user.id, user.status)}
                                disabled={actionLoading === user.id}
                              >
                                Confirmer
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      )}
                      {(user.id === userProfile?.id || user.role === 'admin') && (
                        <span className="text-sm text-gray-500">
                          {user.id === userProfile?.id ? 'Vous' : 'Admin'}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
