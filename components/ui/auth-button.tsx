'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth-provider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, LogOut, Settings } from 'lucide-react';

export function AuthButton() {
  const { user, userProfile, signOut, loading } = useAuth();

  if (loading) {
    return <Button variant="ghost" size="sm" disabled>Chargement...</Button>;
  }

  if (!user || !userProfile) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/login">
          <Button variant="ghost" size="sm">Se connecter</Button>
        </Link>
        <Link href="/register">
          <Button size="sm">S'inscrire</Button>
        </Link>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 p-1" size="sm">
          <Avatar className="h-8 w-8">
            <AvatarImage src={userProfile.avatar || ''} alt={userProfile.name} />
            <AvatarFallback>{userProfile.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <span className="hidden md:inline">{userProfile.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            <p className="font-medium">{userProfile.name}</p>
            <p className="text-sm text-gray-500 truncate w-[200px]">{userProfile.email}</p>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile" className="cursor-pointer flex w-full items-center gap-2">
            <User className="h-4 w-4" />
            Mon profil
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/dashboard" className="cursor-pointer flex w-full items-center gap-2">
            <Settings className="h-4 w-4" />
            Tableau de bord
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="cursor-pointer flex items-center gap-2 text-red-600" 
          onClick={() => signOut()}
        >
          <LogOut className="h-4 w-4" />
          Se déconnecter
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
