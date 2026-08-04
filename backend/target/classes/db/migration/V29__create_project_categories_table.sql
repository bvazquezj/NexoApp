CREATE TABLE project_categories (
    id        UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    name      VARCHAR(100) NOT NULL,
    color     VARCHAR(7)   NOT NULL,
    is_system BOOLEAN      NOT NULL DEFAULT false,
    user_id   UUID         REFERENCES users(id),
    CHECK (is_system = false OR user_id IS NULL)
);

CREATE INDEX idx_project_categories_user ON project_categories(user_id);
