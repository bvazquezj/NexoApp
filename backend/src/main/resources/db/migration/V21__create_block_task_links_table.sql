CREATE TABLE block_task_links (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    routine_block_id UUID        NOT NULL REFERENCES routine_blocks(id) ON DELETE CASCADE,
    task_id          UUID        NOT NULL,
    added_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (routine_block_id, task_id)
);
