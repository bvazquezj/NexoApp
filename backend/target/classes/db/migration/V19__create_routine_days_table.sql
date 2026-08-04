CREATE TABLE routine_days (
    id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID         NOT NULL REFERENCES users(id),
    day_of_week   SMALLINT     NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    name          VARCHAR(100) NOT NULL,
    is_active     BOOLEAN      NOT NULL DEFAULT true,
    template_name VARCHAR(100),
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX uq_routine_days_user_day_active
    ON routine_days (user_id, day_of_week)
    WHERE is_active = true;
