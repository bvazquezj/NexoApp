CREATE TABLE routine_blocks (
    id                      UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    routine_day_id          UUID         NOT NULL REFERENCES routine_days(id) ON DELETE CASCADE,
    title                   VARCHAR(150) NOT NULL,
    start_time              TIME         NOT NULL,
    end_time                TIME         NOT NULL,
    type                    VARCHAR(20)  NOT NULL
                            CHECK (type IN ('HABIT','PRODUCTIVE','SLEEP','BREAK','FREE')),
    habit_id                UUID         REFERENCES habits(id),
    priority                VARCHAR(10)
                            CHECK (priority IS NULL OR priority IN ('HIGH','MEDIUM','LOW')),
    is_flexible             BOOLEAN      NOT NULL DEFAULT false,
    order_index             INT          NOT NULL DEFAULT 0,
    color                   VARCHAR(7),
    notify_start            BOOLEAN      NOT NULL DEFAULT true,
    notify_end              BOOLEAN      NOT NULL DEFAULT true,
    notify_minutes_before   INT          NOT NULL DEFAULT 10
                            CHECK (notify_minutes_before IN (5,10,15)),
    CHECK (end_time > start_time),
    CHECK (type != 'HABIT' OR habit_id IS NOT NULL)
);
