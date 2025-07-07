# 🚀 Application de Gestion de Tâches - Next.js + Supabase

Une application moderne de gestion de tâches construite avec Next.js 13+ et Supabase, prête pour la production.

## ✨ Fonctionnalités

- 📊 **Dashboard complet** avec statistiques et graphiques en temps réel
- ✅ **Gestion de tâches** : CRUD complet avec statuts, priorités, dates d'échéance
- 👥 **Gestion d'utilisateurs** : Attribution et suivi des tâches par utilisateur
- 📦 **Gestion de modules** : Organisation des tâches par projets/modules
- 📈 **Rapports et analytics** : Suivi de la productivité et des performances
- 📤 **Export Excel** : Export des données pour analyses externes
- 🎨 **Interface moderne** : UI responsive avec Tailwind CSS et shadcn/ui
- 🔐 **Backend sécurisé** : Authentification et autorisation via Supabase
- 🌐 **Production ready** : Optimisé pour le déploiement (Vercel, Netlify, etc.)

## 🛠️ Technologies

- **Frontend** : Next.js 13+ (App Router), React 18, TypeScript
- **Styling** : Tailwind CSS, shadcn/ui components
- **Backend** : Supabase (PostgreSQL, Auth, Real-time)
- **Charts** : Recharts pour les visualisations
- **Export** : ExcelJS pour les exports de données
- **Forms** : React Hook Form avec validation Zod

## 🚀 Démarrage Rapide

### 1. Configuration Automatique

```bash
# Clone et setup automatique
npm run setup
```

### 2. Démarrage Manuel

```bash
# Installation
npm install

# Démarrage en développement
npm run dev

# L'app sera disponible sur http://localhost:3000
```

### 3. Configuration Supabase

Créez un fichier `.env.local` :

```bash
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-cle-anonyme
```

### 4. Initialisation des Données

```bash
# Via script
npm run seed

# Ou via l'interface web (bouton "Initialiser les données")
```

## 📁 Structure du Projet

```
├── app/                    # App Router Next.js 13+
│   ├── layout.tsx         # Layout principal
│   ├── page.tsx           # Dashboard homepage
│   └── globals.css        # Styles globaux
├── components/            # Composants React
│   ├── dashboard.tsx      # Tableau de bord principal
│   ├── task-form.tsx      # Formulaire de tâches
│   ├── task-table.tsx     # Table des tâches
│   ├── user-management.tsx # Gestion utilisateurs
│   ├── module-management.tsx # Gestion modules
│   └── ui/                # Composants UI (shadcn/ui)
├── lib/                   # Services et utilitaires
│   ├── supabase.ts        # Client Supabase
│   ├── supabase-services.ts # Services CRUD
│   ├── dashboard-service.ts # Analytics service
│   ├── seed-data.ts       # Données de démonstration
│   ├── excel-export.ts    # Service d'export
│   ├── types.ts           # Types TypeScript
│   └── utils.ts           # Utilitaires
├── scripts/               # Scripts d'aide
│   └── setup.js           # Configuration automatique
└── docs/                  # Documentation
    ├── GUIDE_DEMARRAGE.md # Guide utilisateur
    └── SUPABASE_SETUP.md  # Configuration Supabase
```

## 🗄️ Schéma de Base de Données

### Tables Principales

- **`users`** : Utilisateurs de l'application
- **`modules`** : Projets/modules de tâches
- **`tasks`** : Tâches avec statuts, priorités, assignations

### Relations

- Un utilisateur peut avoir plusieurs tâches
- Un module peut contenir plusieurs tâches
- Chaque tâche appartient à un utilisateur et un module

## 🚀 Déploiement

### Vercel (Recommandé)

1. Push votre code sur GitHub
2. Connectez le repo à Vercel
3. Ajoutez les variables d'environnement Supabase
4. Déployez automatiquement !

### Autres Plateformes

Compatible avec :
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify
- Toute plateforme supportant Next.js

## 🔧 Scripts Disponibles

```bash
npm run dev       # Développement local
npm run build     # Build de production
npm run start     # Démarrage production
npm run lint      # Linting du code
npm run setup     # Configuration automatique
npm run seed      # Initialisation des données
```

## 📊 Fonctionnalités du Dashboard

- **Statistiques globales** : Total tâches, utilisateurs, modules
- **Graphiques** : Distribution par statut, progression par module
- **Tableaux de bord** : Tâches récentes, utilisateurs actifs
- **Filtres avancés** : Par statut, utilisateur, module, date
- **Export de données** : Excel avec tous les détails

## 🔐 Sécurité

- **Row Level Security (RLS)** activé sur Supabase
- **Validation côté client et serveur** avec Zod
- **Types TypeScript stricts** pour la sécurité du code
- **Variables d'environnement** pour les secrets

## 🌟 Points Forts

- ✅ **Production Ready** : Build optimisé, erreurs corrigées
- ✅ **Type Safe** : TypeScript strict avec types complets
- ✅ **Performance** : SSR optimisé, lazy loading
- ✅ **Responsive** : Interface adaptative mobile/desktop
- ✅ **Maintenance** : Code propre, bien documenté
- ✅ **Extensible** : Architecture modulaire pour l'évolution

## 🆘 Support

### Problèmes Courants

1. **Erreur de connexion Supabase** : Vérifiez vos variables d'environnement
2. **Base de données vide** : Utilisez `npm run seed` pour initialiser
3. **Erreurs de build** : Vérifiez que toutes les dépendances sont installées

### Documentation

- `GUIDE_DEMARRAGE.md` : Guide utilisateur complet
- `SUPABASE_SETUP.md` : Configuration détaillée Supabase
- Code commenté dans `/lib` pour les services

## 🤝 Contribution

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push sur la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📝 License

Distribué sous licence MIT. Voir `LICENSE` pour plus d'informations.

## 🙏 Remerciements

- [Next.js](https://nextjs.org/) - Framework React
- [Supabase](https://supabase.com/) - Backend-as-a-Service
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS
- [shadcn/ui](https://ui.shadcn.com/) - Composants UI
- [Vercel](https://vercel.com/) - Plateforme de déploiement

---

**🎉 Application prête pour la production !**

Développée avec ❤️ pour la gestion moderne de tâches et projets.
