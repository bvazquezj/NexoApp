CREATE TABLE tasks (
    id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    title            VARCHAR(255) NOT NULL,
    description      TEXT,
    status           VARCHAR(20)  NOT NULL DEFAULT 'PENDING'
                     CHECK (status IN ('PENDING','READY','REVIEW','COMPLETED')),
    priority         VARCHAR(10)  NOT NULL
                     CHECK (priority IN ('HIGH','MEDIUM','LOW')),
    task_type_id     UUID         NOT NULL REFERENCES task_types(id),
    due_date         DATE,
    start_date       DATE,
    kanban_position  INTEGER,
    project_id       UUID,
    parent_task_id   UUID         REFERENCES tasks(id),
    client_id        UUID,
    iteration_id     UUID,
    user_id          UUID         NOT NULL REFERENCES users(id),
    closing_comment  TEXT,
    google_event_id  VARCHAR(255),
    completed_at     TIMESTAMPTZ,
    deleted_at       TIMESTAMPTZ,
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CHECK (start_date IS NULL OR due_date IS NULL OR start_date <= due_date)
);
