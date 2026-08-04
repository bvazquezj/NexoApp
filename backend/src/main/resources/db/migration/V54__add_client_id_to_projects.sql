ALTER TABLE projects ADD COLUMN client_id UUID REFERENCES clients(id);
CREATE INDEX idx_projects_client ON projects (client_id) WHERE client_id IS NOT NULL;
