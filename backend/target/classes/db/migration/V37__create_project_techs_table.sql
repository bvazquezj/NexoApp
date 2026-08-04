CREATE TABLE project_techs (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id  UUID         NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name        VARCHAR(100) NOT NULL,
    category    VARCHAR(20)  NOT NULL
                CHECK (category IN ('FRONTEND','BACKEND','DATABASE','DEVOPS','MOBILE','OTHER')),
    CONSTRAINT uq_project_tech_name UNIQUE (project_id, name)
);
