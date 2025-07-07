# 🚨 Correction des Erreurs 401 Supabase

## Problème Identifié
Erreurs 401 = Problème d'authentification Supabase
- Soit variables d'environnement manquantes sur Vercel
- Soit Row Level Security (RLS) bloquant l'accès

## 🔧 Solutions (dans l'ordre de priorité)

### 1. Vérifier les Variables d'Environnement sur Vercel

**URGENT** : Allez sur votre dashboard Vercel

1. **Ouvrez votre projet** sur vercel.com
2. **Allez dans Settings** → **Environment Variables**
3. **Vérifiez que ces 2 variables existent EXACTEMENT** :

```
NEXT_PUBLIC_SUPABASE_URL
Valeur: https://cfxhauelwgrbtutxzzay.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY  
Valeur: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmeGhhdWVsd2dyYnR1dHh6emF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4ODI0MzAsImV4cCI6MjA2NzQ1ODQzMH0.xgM0KuEKJ79P39_zgnNV1-zz2bHu7E8mYqwsgUmpGQE
```

4. **Assurez-vous** qu'elles sont définies pour **Production**, **Preview** ET **Development**
5. **Redéployez** votre application

### 2. Corriger Supabase RLS (Row Level Security)

Si les variables sont correctes mais erreurs 401 persistent :

#### Option A : Désactiver RLS (Recommandé pour debug)

1. **Allez sur [Supabase Dashboard](https://app.supabase.com)**
2. **Sélectionnez votre projet** `cfxhauelwgrbtutxzzay`
3. **Allez dans SQL Editor**
4. **Copiez et exécutez** ce code :

```sql
-- Désactiver RLS sur toutes les tables
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules DISABLE ROW LEVEL SECURITY; 
ALTER TABLE public.tasks DISABLE ROW LEVEL SECURITY;

-- Donner les permissions
GRANT ALL ON public.users TO anon;
GRANT ALL ON public.modules TO anon;
GRANT ALL ON public.tasks TO anon;
```

#### Option B : Créer des Politiques RLS Permissives

Si vous voulez garder RLS actif :

```sql
-- Activer RLS avec politiques permissives
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on users" ON public.users FOR ALL USING (true);

ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on modules" ON public.modules FOR ALL USING (true);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on tasks" ON public.tasks FOR ALL USING (true);
```

### 3. Vérifier la Création des Tables

Si erreurs persistent, vérifiez que les tables existent :

1. **Supabase Dashboard** → **Table Editor**
2. **Vérifiez la présence de** : `users`, `modules`, `tasks`
3. **Si elles n'existent pas**, exécutez le fichier `supabase-schema.sql`

### 4. Test de Connexion

Après correction :

1. **Attendez 1-2 minutes** (propagation)
2. **Rechargez votre app Vercel**
3. **Ouvrez la console** (F12) pour vérifier
4. **Les erreurs 401 doivent disparaître**

## 🎯 Diagnostic Rapide

### Erreur : Variables d'environnement
```
NEXT_PUBLIC_SUPABASE_URL is undefined
```
→ **Solution** : Ajouter les variables sur Vercel

### Erreur : Table n'existe pas
```
relation "public.tasks" does not exist
```
→ **Solution** : Exécuter `supabase-schema.sql`

### Erreur : RLS actif
```
new row violates row-level security policy
```
→ **Solution** : Désactiver RLS ou ajouter politiques

## 🚀 Test Final

Une fois corrigé, votre app doit :

- ✅ Afficher le dashboard sans erreurs 401
- ✅ Charger les données (même si vides)
- ✅ Permettre de créer des tâches/utilisateurs
- ✅ Bouton "Tester la connexion" = succès

## 📞 Si Problème Persiste

1. **Vérifiez les logs Vercel** : Dashboard → Functions → Logs
2. **Testez en local** : `npm run dev` (doit marcher)
3. **Comparez** les variables local vs Vercel
4. **Contactez** : Les erreurs exactes dans la console

---

**💡 Dans 90% des cas, c'est un problème de variables d'environnement sur Vercel !**
