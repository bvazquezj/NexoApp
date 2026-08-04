CREATE TABLE routine_templates (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    is_system   BOOLEAN      NOT NULL DEFAULT false,
    user_id     UUID         REFERENCES users(id),
    blocks      JSONB        NOT NULL,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CHECK (is_system = false OR user_id IS NULL)
);
