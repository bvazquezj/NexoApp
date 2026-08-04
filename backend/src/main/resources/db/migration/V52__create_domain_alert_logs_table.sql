CREATE TABLE domain_alert_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain_id UUID NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
    alert_type VARCHAR(25) NOT NULL CHECK (alert_type IN ('EXPIRING_15_DAYS','EXPIRING_2_DAYS','EXPIRED')),
    sent_at TIMESTAMPTZ NOT NULL
);
