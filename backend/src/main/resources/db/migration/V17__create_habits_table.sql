CREATE TABLE habits (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID         NOT NULL REFERENCES users(id),
    category_id     UUID         NOT NULL REFERENCES habit_categories(id),
    name            VARCHAR(100) NOT NULL,
    description     VARCHAR(500),
    frequency       VARCHAR(10)  NOT NULL
                    CHECK (frequency IN ('DAILY','CUSTOM')),
    frequency_days  INTEGER[],
    is_active       BOOLEAN      NOT NULL DEFAULT true,
    color           VARCHAR(7)   NOT NULL,
    icon            VARCHAR(50),
    current_streak  INT          NOT NULL DEFAULT 0,
    max_streak      INT          NOT NULL DEFAULT 0,
    deleted_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CHECK (frequency != 'CUSTOM' OR frequency_days IS NOT NULL)
);
