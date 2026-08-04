CREATE TABLE subdomains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain_id UUID NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
    prefix VARCHAR(63) NOT NULL,
    deployment_id UUID REFERENCES deployments(id),
    notes VARCHAR(500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_subdomain_prefix UNIQUE (domain_id, prefix)
);
