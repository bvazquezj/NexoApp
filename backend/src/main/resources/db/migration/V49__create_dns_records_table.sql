CREATE TABLE dns_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain_id UUID NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
    type VARCHAR(10) NOT NULL CHECK (type IN ('A','AAAA','CNAME','MX','TXT','NS','CAA')),
    host VARCHAR(255) NOT NULL,
    expected_value TEXT NOT NULL,
    ttl INTEGER,
    priority INTEGER,
    resolved_value TEXT,
    resolved_at TIMESTAMPTZ,
    has_mismatch BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
