CREATE TABLE tech_catalog (
    id       UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    name     VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(20)  NOT NULL
             CHECK (category IN ('FRONTEND','BACKEND','DATABASE','DEVOPS','MOBILE','OTHER'))
);

CREATE INDEX idx_tech_catalog_name ON tech_catalog USING gin (name gin_trgm_ops);
