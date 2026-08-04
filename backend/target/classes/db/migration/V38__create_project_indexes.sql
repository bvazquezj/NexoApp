CREATE INDEX idx_projects_user_status     ON projects (user_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_projects_user_deleted    ON projects (user_id, deleted_at);
CREATE INDEX idx_projects_due_date        ON projects (user_id, due_date) WHERE deleted_at IS NULL;
CREATE INDEX idx_project_notes_project    ON project_notes (project_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_project_links_project    ON project_links (project_id);
CREATE INDEX idx_project_iterations_project ON project_iterations (project_id);
CREATE INDEX idx_project_techs_project    ON project_techs (project_id);
