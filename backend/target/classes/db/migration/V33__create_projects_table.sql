CREATE TABLE projects (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID         NOT NULL REFERENCES users(id),
    name            VARCHAR(150) NOT NULL,
    description     VARCHAR(2000),
    status          VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE'
                    CHECK (status IN ('ACTIVE','IN_PROGRESS','PAUSED','COMPLETED','CANCELLED','ARCHIVED')),
    category_id     UUID         NOT NULL REFERENCES project_categories(id),
    start_date      DATE,
    due_date        DATE         NOT NULL,
    in_progress_at  TIMESTAMPTZ,
    completed_at    TIMESTAMPTZ,
    deleted_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CHECK (start_date IS NULL OR start_date <= due_date)
);
