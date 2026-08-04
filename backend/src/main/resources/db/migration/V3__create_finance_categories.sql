CREATE TABLE finance_categories (
    id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    name       VARCHAR(100) NOT NULL,
    type       VARCHAR(10)  NOT NULL CHECK (type IN ('INCOME','EXPENSE','BOTH')),
    color      VARCHAR(7)   NOT NULL,
    user_id    UUID         REFERENCES users(id),
    created_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_finance_categories_user_id ON finance_categories(user_id);

CREATE UNIQUE INDEX uq_finance_categories_system_name
    ON finance_categories(name) WHERE user_id IS NULL;

CREATE UNIQUE INDEX uq_finance_categories_user_name
    ON finance_categories(user_id, name) WHERE user_id IS NOT NULL;

-- System categories (user_id = NULL, not editable or deletable)
INSERT INTO finance_categories (name, type, color) VALUES
    ('Comida',          'EXPENSE', '#FF6B6B'),
    ('Transporte',      'EXPENSE', '#4A90E2'),
    ('Vivienda',        'EXPENSE', '#50C878'),
    ('Salud',           'EXPENSE', '#FF8C00'),
    ('Entretenimiento', 'EXPENSE', '#9B59B6'),
    ('Educación',       'EXPENSE', '#3498DB'),
    ('Suscripciones',   'EXPENSE', '#E74C3C'),
    ('Otros gastos',    'EXPENSE', '#95A5A6'),
    ('Salario',         'INCOME',  '#2ECC71'),
    ('Freelance',       'INCOME',  '#1ABC9C'),
    ('Inversiones',     'INCOME',  '#F39C12'),
    ('Otros ingresos',  'INCOME',  '#27AE60');
