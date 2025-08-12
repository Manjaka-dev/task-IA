'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Check, X, User, Mail, Shield } from 'lucide-react';
import { authService } from '@/lib/auth-service';
import { UserRequest } from '@/lib/types';
import { useAuth } from '@/components/auth-provider';
import { formatDate } from '@/lib/utils';

export default function UserRequestManagement() {
  const [requests, setRequests] = useState<UserRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<UserRequest | null>(null);
  const { userProfile } = useAuth();

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await authService.getPendingUserRequests();
      setRequests(data);
    } catch (error: any) {
      setError(error.message || 'Erreur lors du chargement des demandes');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    if (!userProfile) return;

    try {
      setActionLoading(requestId);
      await authService.approveUserRequest(requestId, userProfile.id);
      await loadRequests(); // Recharger la liste
    } catch (error: any) {
      setError(error.message || 'Erreur lors de l\'approbation');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (requestId: string, reason?: string) => {
    if (!userProfile) return;

    try {
      setActionLoading(requestId);
      await authService.rejectUserRequest(requestId, userProfile.id, reason);
      await loadRequests(); // Recharger la liste
      setSelectedRequest(null);
      setRejectionReason('');
    } catch (error: any) {
      setError(error.message || 'Erreur lors du rejet');
    } finally {
      setActionLoading(null);
    }
  };

  const getRoleColor = (role: string) => {
    const colors = {
      admin: 'bg-red-100 text-red-800',
      manager: 'bg-blue-100 text-blue-800',
      developer: 'bg-green-100 text-green-800',
      designer: 'bg-purple-100 text-purple-800',
    };
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800';
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

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Demandes d'inscription</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Chargement...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Demandes d'inscription en attente
        </CardTitle>
        <CardDescription>
          Gérez les demandes d'accès à l'application
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {requests.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Aucune demande d'inscription en attente
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rôle demandé</TableHead>
                <TableHead>Date de demande</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {request.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {request.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getRoleColor(request.role)}>
                      <Shield className="h-3 w-3 mr-1" />
                      {getRoleLabel(request.role)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {formatDate(new Date(request.requestedAt))}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleApprove(request.id)}
                        disabled={actionLoading === request.id}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Approuver
                      </Button>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={actionLoading === request.id}
                            onClick={() => setSelectedRequest(request)}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Refuser
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Refuser la demande</DialogTitle>
                            <DialogDescription>
                              Vous êtes sur le point de refuser la demande d'inscription de{' '}
                              <strong>{selectedRequest?.name}</strong>.
                              Vous pouvez optionnellement ajouter une raison.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <Textarea
                              placeholder="Raison du refus (optionnel)"
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                              rows={3}
                            />
                          </div>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setSelectedRequest(null);
                                setRejectionReason('');
                              }}
                            >
                              Annuler
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => selectedRequest && handleReject(selectedRequest.id, rejectionReason)}
                              disabled={actionLoading === selectedRequest?.id}
                            >
                              Confirmer le refus
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
