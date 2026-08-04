CREATE TABLE notifications (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID         NOT NULL REFERENCES users(id),
    type        VARCHAR(50)  NOT NULL,
    title       VARCHAR(150) NOT NULL,
    message     VARCHAR(500) NOT NULL,
    read        BOOLEAN      NOT NULL DEFAULT false,
    metadata    JSONB,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);
