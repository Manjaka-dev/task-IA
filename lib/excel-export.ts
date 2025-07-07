import * as XLSX from 'xlsx';
import { Task, User, Module } from './types';

export const exportTasksToExcel = (
  tasks: Task[],
  users: User[],
  modules: Module[]
) => {
  const getUserName = (userId: string) => 
    users.find(u => u.id === userId)?.name || 'Non assigné';
  
  const getModuleName = (moduleId: string) =>
    modules.find(m => m.id === moduleId)?.name || 'Module inconnu';

  const excelData = tasks.map(task => ({
    'Libellé': task.title,
    'Description': task.description || '',
    'Assigné à': getUserName(task.assignedTo),
    'Module': getModuleName(task.moduleId),
    'Statut': task.status,
    'Priorité': task.priority,
    'Temps prévu (h)': task.estimatedTime,
    'Temps pris (h)': task.actualTime,
    'Écart (h)': task.actualTime - task.estimatedTime,
    'Efficacité (%)': task.estimatedTime > 0 ? 
      Math.round((task.estimatedTime / task.actualTime) * 100) : 0,
    'Date de création': task.createdAt.toLocaleDateString('fr-FR'),
    'Dernière mise à jour': task.updatedAt.toLocaleDateString('fr-FR'),
    'Date limite': task.dueDate?.toLocaleDateString('fr-FR') || '',
    'Commentaires': task.comments.length,
  }));

  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Tâches');

  // Ajout des feuilles pour les utilisateurs et modules
  const usersData = users.map(user => ({
    'Nom': user.name,
    'Email': user.email,
    'Rôle': user.role,
    'Date de création': user.createdAt.toLocaleDateString('fr-FR'),
  }));

  const modulesData = modules.map(module => ({
    'Nom': module.name,
    'Description': module.description,
    'Couleur': module.color,
    'Date de création': module.createdAt.toLocaleDateString('fr-FR'),
  }));

  const usersSheet = XLSX.utils.json_to_sheet(usersData);
  const modulesSheet = XLSX.utils.json_to_sheet(modulesData);
  
  XLSX.utils.book_append_sheet(workbook, usersSheet, 'Utilisateurs');
  XLSX.utils.book_append_sheet(workbook, modulesSheet, 'Modules');

  const fileName = `gestion_taches_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};