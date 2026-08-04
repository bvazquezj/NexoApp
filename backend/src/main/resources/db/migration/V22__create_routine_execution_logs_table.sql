CREATE TABLE routine_execution_logs (
    id                  UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    routine_block_id    UUID         NOT NULL REFERENCES routine_blocks(id) ON DELETE CASCADE,
    date                DATE         NOT NULL,
    actual_start_time   TIME,
    actual_end_time     TIME,
    completed           BOOLEAN      NOT NULL DEFAULT false,
    source              VARCHAR(20)  NOT NULL
                        CHECK (source IN ('MANUAL','AUTO','SAMSUNG_HEALTH')),
    notes               VARCHAR(500),
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT now(),
    UNIQUE (routine_block_id, date)
);
