CREATE TABLE project_links (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id  UUID         NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    type        VARCHAR(20)  NOT NULL
                CHECK (type IN ('GITHUB','DEPLOY','STAGING','DOCS','FIGMA','JIRA','LINEAR','NOTION','TRELLO','OTHER')),
    label       VARCHAR(100) NOT NULL,
    url         VARCHAR(500) NOT NULL,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);
