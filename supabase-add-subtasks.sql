-- Ajouter une table pour les sous-tâches
CREATE TABLE subtasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR NOT NULL,
    description TEXT,
    status VARCHAR(50) CHECK (status IN ('todo', 'in-progress', 'completed')) DEFAULT 'todo' NOT NULL,
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Ajouter une contrainte pour empêcher la tâche principale d'être terminée si des sous-tâches ne le sont pas
CREATE FUNCTION check_subtasks_completion() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' THEN
        IF EXISTS (
            SELECT 1 FROM subtasks WHERE task_id = NEW.id AND status != 'completed'
        ) THEN
            RAISE EXCEPTION 'Cannot complete task with incomplete subtasks';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_task_completion
BEFORE UPDATE OF status ON tasks
FOR EACH ROW
EXECUTE FUNCTION check_subtasks_completion();
