CREATE TABLE user_integrations (
    id                       UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                  UUID         NOT NULL REFERENCES users(id),
    provider                 VARCHAR(50)  NOT NULL,
    access_token_encrypted   TEXT,
    refresh_token_encrypted  TEXT,
    token_expires_at         TIMESTAMPTZ,
    scope                    VARCHAR(500),
    last_synced_at           TIMESTAMPTZ,
    status                   VARCHAR(20)  NOT NULL DEFAULT 'CONNECTED'
                             CHECK (status IN ('CONNECTED','EXPIRED','REVOKED')),
    created_at               TIMESTAMPTZ  NOT NULL DEFAULT now(),
    UNIQUE (user_id, provider)
);
