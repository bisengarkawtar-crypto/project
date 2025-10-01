/*
  # Création du schéma initial pour l'application To-Do List

  ## Description
  Cette migration crée toutes les tables nécessaires pour une application de to-do list 
  collaborative avec catégories, priorités, stickers et listes partagées.

  ## 1. Nouvelles Tables
  
  ### `categories`
  - `id` (uuid, clé primaire)
  - `name` (text, nom de la catégorie)
  - `color` (text, couleur hexadécimale)
  - `created_at` (timestamptz, date de création)
  
  ### `tasks`
  - `id` (uuid, clé primaire)
  - `title` (text, titre de la tâche)
  - `note` (text, notes détaillées)
  - `is_completed` (boolean, statut de complétion)
  - `priority` (text, niveau de priorité: Urgent, Important, Normal)
  - `reminder` (timestamptz, date/heure du rappel)
  - `category_id` (uuid, référence à categories)
  - `user_id` (uuid, référence à auth.users)
  - `shared_list_id` (uuid, référence à shared_lists)
  - `completed_by` (uuid, utilisateur qui a complété la tâche)
  - `completed_at` (timestamptz, date de complétion)
  - `sticker` (text, emoji/sticker associé à la tâche)
  - `created_at` (timestamptz, date de création)
  - `updated_at` (timestamptz, date de dernière modification)

  ### `shared_lists`
  - `id` (uuid, clé primaire)
  - `name` (text, nom de la liste)
  - `share_code` (text, code de partage unique)
  - `owner_id` (uuid, référence à auth.users)
  - `created_at` (timestamptz, date de création)

  ### `shared_list_members`
  - `id` (uuid, clé primaire)
  - `list_id` (uuid, référence à shared_lists)
  - `user_id` (uuid, référence à auth.users)
  - `joined_at` (timestamptz, date d'adhésion)

  ### `habits`
  - `id` (uuid, clé primaire)
  - `user_id` (uuid, référence à auth.users)
  - `title` (text, titre de l'habitude)
  - `description` (text, description)
  - `frequency` (text, fréquence: Quotidien, Hebdomadaire)
  - `icon` (text, icône/emoji)
  - `created_at` (timestamptz, date de création)

  ### `habit_completions`
  - `id` (uuid, clé primaire)
  - `habit_id` (uuid, référence à habits)
  - `completed_at` (timestamptz, date de complétion)
  - `user_id` (uuid, référence à auth.users)

  ## 2. Sécurité
  - RLS activé sur toutes les tables
  - Politiques restrictives par défaut
  - Accès basé sur l'authentification et la propriété
  - Politiques spécifiques pour les listes partagées

  ## 3. Index
  - Index sur les clés étrangères pour optimiser les requêtes
  - Index sur les champs de recherche fréquents

  ## 4. Contraintes
  - Contraintes de clé étrangère avec CASCADE pour la suppression
  - Contraintes d'unicité pour les codes de partage
*/

-- Créer la table categories
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  color text DEFAULT '#3B82F6',
  created_at timestamptz DEFAULT now()
);

-- Créer la table shared_lists
CREATE TABLE IF NOT EXISTS shared_lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  share_code text UNIQUE NOT NULL,
  owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Créer la table shared_list_members
CREATE TABLE IF NOT EXISTS shared_list_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id uuid REFERENCES shared_lists(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(list_id, user_id)
);

-- Créer la table tasks
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  note text DEFAULT '',
  is_completed boolean DEFAULT false,
  priority text DEFAULT 'Normal' CHECK (priority IN ('Urgent', 'Important', 'Normal')),
  reminder timestamptz,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_list_id uuid REFERENCES shared_lists(id) ON DELETE CASCADE,
  completed_by uuid REFERENCES auth.users(id),
  completed_at timestamptz,
  sticker text DEFAULT '📝',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Créer la table habits
CREATE TABLE IF NOT EXISTS habits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  frequency text DEFAULT 'Quotidien' CHECK (frequency IN ('Quotidien', 'Hebdomadaire')),
  icon text DEFAULT '⭐',
  created_at timestamptz DEFAULT now()
);

-- Créer la table habit_completions
CREATE TABLE IF NOT EXISTS habit_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id uuid REFERENCES habits(id) ON DELETE CASCADE NOT NULL,
  completed_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Créer des index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_shared_list_id ON tasks(shared_list_id);
CREATE INDEX IF NOT EXISTS idx_tasks_category_id ON tasks(category_id);
CREATE INDEX IF NOT EXISTS idx_shared_list_members_list_id ON shared_list_members(list_id);
CREATE INDEX IF NOT EXISTS idx_shared_list_members_user_id ON shared_list_members(user_id);
CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits(user_id);
CREATE INDEX IF NOT EXISTS idx_habit_completions_habit_id ON habit_completions(habit_id);

-- Activer RLS sur toutes les tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_list_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_completions ENABLE ROW LEVEL SECURITY;

-- Politiques pour categories (accessible à tous les utilisateurs authentifiés)
CREATE POLICY "Authenticated users can view categories"
  ON categories FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert categories"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Politiques pour tasks (personnel ou partagé)
CREATE POLICY "Users can view own tasks"
  ON tasks FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR shared_list_id IN (
      SELECT list_id FROM shared_list_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own tasks"
  ON tasks FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    OR (
      shared_list_id IN (
        SELECT list_id FROM shared_list_members WHERE user_id = auth.uid()
      )
      AND user_id IS NULL
    )
  );

CREATE POLICY "Users can update own tasks"
  ON tasks FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
    OR shared_list_id IN (
      SELECT list_id FROM shared_list_members WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    auth.uid() = user_id
    OR shared_list_id IN (
      SELECT list_id FROM shared_list_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own tasks"
  ON tasks FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id
    OR shared_list_id IN (
      SELECT list_id FROM shared_list_members WHERE user_id = auth.uid()
    )
  );

-- Politiques pour shared_lists
CREATE POLICY "Users can view shared lists they own or are members of"
  ON shared_lists FOR SELECT
  TO authenticated
  USING (
    auth.uid() = owner_id
    OR id IN (
      SELECT list_id FROM shared_list_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create shared lists"
  ON shared_lists FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their shared lists"
  ON shared_lists FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can delete their shared lists"
  ON shared_lists FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

-- Politiques pour shared_list_members
CREATE POLICY "Users can view members of lists they belong to"
  ON shared_list_members FOR SELECT
  TO authenticated
  USING (
    list_id IN (
      SELECT id FROM shared_lists WHERE owner_id = auth.uid()
    )
    OR list_id IN (
      SELECT list_id FROM shared_list_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join shared lists"
  ON shared_list_members FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave shared lists"
  ON shared_list_members FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Politiques pour habits
CREATE POLICY "Users can view own habits"
  ON habits FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own habits"
  ON habits FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own habits"
  ON habits FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own habits"
  ON habits FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Politiques pour habit_completions
CREATE POLICY "Users can view own habit completions"
  ON habit_completions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own habit completions"
  ON habit_completions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own habit completions"
  ON habit_completions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Insérer des catégories par défaut
INSERT INTO categories (name, color) VALUES
  ('Travail', '#3B82F6'),
  ('Personnel', '#10B981'),
  ('Sport', '#EF4444'),
  ('Études', '#8B5CF6'),
  ('Courses', '#F59E0B'),
  ('Santé', '#EC4899')
ON CONFLICT DO NOTHING;