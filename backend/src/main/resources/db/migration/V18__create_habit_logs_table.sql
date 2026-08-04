CREATE TABLE habit_logs (
    id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    habit_id     UUID         NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
    date         DATE         NOT NULL,
    completed    BOOLEAN      NOT NULL DEFAULT true,
    completed_at TIMESTAMPTZ,
    source       VARCHAR(20)  NOT NULL
                 CHECK (source IN ('MANUAL','ROUTINE','AUTO')),
    UNIQUE (habit_id, date)
);
