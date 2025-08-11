'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Calendar, Mail, User, Clock } from 'lucide-react';
import PasswordChangeForm from '@/components/password-change-form';
import { useAuth } from '@/components/auth-provider';
import { formatDate, formatDateTime, getInitials, getRoleColor } from '@/lib/utils';

// Cette page est un composant client pour accéder aux données utilisateur
export default function ProfilePage() {
  const { userProfile } = useAuth();

  if (!userProfile) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">Chargement...</div>
      </div>
    );
  }

  const getRoleLabel = (role: string) => {
    const labels = {
      admin: 'Administrateur',
      manager: 'Manager',
      developer: 'Développeur',
      designer: 'Designer',
    };
    return labels[role as keyof typeof labels] || role;
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Mon Profil</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informations du profil */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informations personnelles
            </CardTitle>
            <CardDescription>
              Vos informations de profil
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={userProfile.avatar} alt={userProfile.name} />
                <AvatarFallback className="text-lg">
                  {getInitials(userProfile.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-semibold">{userProfile.name}</h3>
                <Badge className={getRoleColor(userProfile.role)}>
                  {getRoleLabel(userProfile.role)}
                </Badge>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-gray-500" />
                <span>{userProfile.email}</span>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span>
                  Membre depuis le {formatDate(new Date(userProfile.createdAt))}
                </span>
              </div>

              {userProfile.lastLogin && (
                <div className="flex items-center space-x-3">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>
                    Dernière connexion : {formatDateTime(new Date(userProfile.lastLogin))}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Changement de mot de passe */}
        <PasswordChangeForm />
      </div>
    </div>
  );
}
