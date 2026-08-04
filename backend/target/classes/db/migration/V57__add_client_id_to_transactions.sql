-- The client_id column was created in V4 without a FK constraint.
-- This migration adds the FK constraint now that the clients table exists.
ALTER TABLE transactions ADD CONSTRAINT fk_transactions_client FOREIGN KEY (client_id) REFERENCES clients(id);
CREATE INDEX idx_transactions_client ON transactions (client_id) WHERE client_id IS NOT NULL;
