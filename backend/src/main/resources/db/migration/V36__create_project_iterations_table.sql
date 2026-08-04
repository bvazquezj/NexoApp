CREATE TABLE project_iterations (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id  UUID         NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    number      INTEGER      NOT NULL,
    name        VARCHAR(150),
    goal        VARCHAR(500),
    status      VARCHAR(20)  NOT NULL DEFAULT 'PLANNED'
                CHECK (status IN ('PLANNED','ACTIVE','COMPLETED')),
    start_date  DATE,
    end_date    DATE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT uq_iteration_project_number UNIQUE (project_id, number)
);

CREATE UNIQUE INDEX uq_iteration_project_active
    ON project_iterations (project_id)
    WHERE status = 'ACTIVE';
