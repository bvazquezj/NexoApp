CREATE TABLE deployment_health_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deployment_id UUID NOT NULL REFERENCES deployments(id) ON DELETE CASCADE,
    result VARCHAR(10) NOT NULL CHECK (result IN ('UP','DEGRADED','DOWN','TIMEOUT')),
    http_status_code INTEGER,
    response_time_ms INTEGER,
    error VARCHAR(500),
    checked_at TIMESTAMPTZ NOT NULL
);
