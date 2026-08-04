-- The client_id column was created in V11 without a FK constraint.
-- This migration adds the FK constraint now that the clients table exists.
ALTER TABLE tasks ADD CONSTRAINT fk_tasks_client FOREIGN KEY (client_id) REFERENCES clients(id);
CREATE INDEX idx_tasks_client ON tasks (client_id) WHERE client_id IS NOT NULL;
