import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gestion de Projets - TaskFlow',
  description: 'Application complète de gestion de tâches et projets',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}