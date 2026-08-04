-- La tabla la crea Hibernate vía ddl-auto: update desde la entidad TaskStatusDefinition.
-- Esta migración solo asegura índices, datos semilla y la eliminación del CHECK constraint.

CREATE UNIQUE INDEX IF NOT EXISTS idx_task_status_definitions_name ON task_status_definitions(name);
CREATE INDEX IF NOT EXISTS idx_task_status_definitions_user ON task_status_definitions(user_id);

INSERT INTO task_status_definitions (id, name, display_name, color, position, is_system) VALUES
    ('00000000-0000-0000-0000-000000000001', 'PENDING',   'Pendiente',   '#6B7280',  0, true),
    ('00000000-0000-0000-0000-000000000002', 'READY',     'Listo',       '#3B82F6',  1, true),
    ('00000000-0000-0000-0000-000000000003', 'REVIEW',    'Revisión',   '#F59E0B',  2, true),
    ('00000000-0000-0000-0000-000000000004', 'COMPLETED', 'Completada', '#10B981',  3, true)
ON CONFLICT (name) DO NOTHING;

-- Remove old CHECK constraint that limited status to the 4 original values
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_status_check;
