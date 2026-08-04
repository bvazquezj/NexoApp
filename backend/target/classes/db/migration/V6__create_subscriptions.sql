CREATE TABLE subscriptions (
    id                UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    name              VARCHAR(150)  NOT NULL,
    amount            NUMERIC(19,4) NOT NULL CHECK (amount > 0),
    currency          VARCHAR(3)    NOT NULL CHECK (currency IN ('MXN','USD')),
    frequency         VARCHAR(10)   NOT NULL CHECK (frequency IN ('MONTHLY','YEARLY','WEEKLY')),
    next_billing_date DATE          NOT NULL,
    category_id       UUID          NOT NULL REFERENCES finance_categories(id),
    active            BOOLEAN       NOT NULL DEFAULT true,
    user_id           UUID          NOT NULL REFERENCES users(id),
    created_at        TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX idx_subscriptions_user_id     ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_user_active ON subscriptions(user_id, active);
