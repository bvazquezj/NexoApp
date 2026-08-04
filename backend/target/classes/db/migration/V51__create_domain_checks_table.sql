CREATE TABLE domain_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain_id UUID NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
    result VARCHAR(20) NOT NULL CHECK (result IN ('OK','MISMATCH','UNRESOLVABLE','ERROR')),
    resolved_ips JSONB,
    mismatch_count INTEGER NOT NULL DEFAULT 0,
    error_message VARCHAR(500),
    triggered_by VARCHAR(20) NOT NULL CHECK (triggered_by IN ('SCHEDULED','MANUAL')),
    checked_at TIMESTAMPTZ NOT NULL
);
