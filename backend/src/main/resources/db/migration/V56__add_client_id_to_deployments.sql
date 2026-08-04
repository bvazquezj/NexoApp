ALTER TABLE deployments ADD COLUMN client_id UUID REFERENCES clients(id);
CREATE INDEX idx_deployments_client ON deployments (client_id) WHERE client_id IS NOT NULL;
