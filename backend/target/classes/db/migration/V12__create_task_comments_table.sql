CREATE TABLE task_comments (
    id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id            UUID        NOT NULL REFERENCES tasks(id),
    user_id            UUID        NOT NULL REFERENCES users(id),
    body               TEXT        NOT NULL,
    is_closing_comment BOOLEAN     NOT NULL DEFAULT false,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);
