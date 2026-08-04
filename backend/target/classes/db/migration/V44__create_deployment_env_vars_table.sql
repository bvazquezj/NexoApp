CREATE TABLE deployment_env_vars (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deployment_id UUID NOT NULL REFERENCES deployments(id) ON DELETE CASCADE,
    key VARCHAR(200) NOT NULL,
    value TEXT NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('PUBLIC','SECRET')),
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX uq_env_var_key_active ON deployment_env_vars (deployment_id, key) WHERE deleted_at IS NULL;
