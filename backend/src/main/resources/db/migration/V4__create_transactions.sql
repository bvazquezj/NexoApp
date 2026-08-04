CREATE TABLE transactions (
    id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    type          VARCHAR(10)   NOT NULL CHECK (type IN ('INCOME','EXPENSE')),
    amount        NUMERIC(19,4) NOT NULL CHECK (amount > 0),
    currency      VARCHAR(3)    NOT NULL CHECK (currency IN ('MXN','USD')),
    exchange_rate NUMERIC(19,6) NOT NULL CHECK (exchange_rate > 0),
    description   VARCHAR(255),
    date          DATE          NOT NULL,
    category_id   UUID          NOT NULL REFERENCES finance_categories(id),
    user_id       UUID          NOT NULL REFERENCES users(id),
    client_id     UUID,
    deleted_at    TIMESTAMPTZ,
    created_at    TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX idx_transactions_user_id          ON transactions(user_id);
CREATE INDEX idx_transactions_user_date        ON transactions(user_id, date);
CREATE INDEX idx_transactions_user_category    ON transactions(user_id, category_id);
CREATE INDEX idx_transactions_deleted_at       ON transactions(deleted_at);
CREATE INDEX idx_transactions_user_type_date   ON transactions(user_id, type, date);
CREATE INDEX idx_transactions_active           ON transactions(user_id, date) WHERE deleted_at IS NULL;
