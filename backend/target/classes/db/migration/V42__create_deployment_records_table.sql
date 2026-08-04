CREATE TABLE deployment_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deployment_id UUID NOT NULL REFERENCES deployments(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    branch VARCHAR(200),
    version VARCHAR(100),
    source VARCHAR(20) NOT NULL CHECK (source IN ('MANUAL','WEBHOOK','API_IMPORT')),
    webhook_payload JSONB,
    notes VARCHAR(500),
    deployed_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
