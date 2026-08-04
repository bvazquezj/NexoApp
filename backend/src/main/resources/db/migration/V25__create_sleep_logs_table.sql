CREATE TABLE sleep_logs (
    id                UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID         NOT NULL REFERENCES users(id),
    date              DATE         NOT NULL,
    sleep_start       TIMESTAMPTZ  NOT NULL,
    sleep_end         TIMESTAMPTZ  NOT NULL,
    duration_minutes  INT          NOT NULL,
    source            VARCHAR(20)  NOT NULL
                      CHECK (source IN ('SAMSUNG_HEALTH','MANUAL')),
    synced_at         TIMESTAMPTZ  NOT NULL DEFAULT now(),
    UNIQUE (user_id, date),
    CHECK (sleep_end > sleep_start)
);
