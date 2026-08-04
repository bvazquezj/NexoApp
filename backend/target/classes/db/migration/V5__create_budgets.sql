CREATE TABLE budgets (
    id           UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id  UUID          NOT NULL REFERENCES finance_categories(id),
    limit_amount NUMERIC(19,4) NOT NULL CHECK (limit_amount > 0),
    currency     VARCHAR(3)    NOT NULL CHECK (currency IN ('MXN','USD')),
    month        SMALLINT      NOT NULL CHECK (month BETWEEN 1 AND 12),
    year         SMALLINT      NOT NULL,
    user_id      UUID          NOT NULL REFERENCES users(id),
    created_at   TIMESTAMPTZ   NOT NULL DEFAULT now(),

    CONSTRAINT uq_budgets_user_category_month_year UNIQUE (user_id, category_id, month, year)
);

CREATE INDEX idx_budgets_user_month_year ON budgets(user_id, month, year);
