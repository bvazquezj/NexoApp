CREATE TABLE domain_nameservers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain_id UUID NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
    value VARCHAR(255) NOT NULL,
    order_index INTEGER NOT NULL,
    deleted_at TIMESTAMPTZ
);
