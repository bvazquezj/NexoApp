CREATE INDEX idx_tasks_user_deleted    ON tasks (user_id, deleted_at);
CREATE INDEX idx_tasks_user_status     ON tasks (user_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_tasks_due_date        ON tasks (user_id, due_date) WHERE deleted_at IS NULL AND status != 'COMPLETED';
CREATE INDEX idx_tasks_parent          ON tasks (parent_task_id) WHERE parent_task_id IS NOT NULL;
CREATE INDEX idx_task_comments_task    ON task_comments (task_id);
CREATE INDEX idx_saved_filters_user    ON saved_filters (user_id);
CREATE INDEX idx_tasks_review_updated  ON tasks (status, updated_at) WHERE status = 'REVIEW' AND deleted_at IS NULL;
CREATE INDEX idx_tasks_kanban_order    ON tasks (user_id, status, kanban_position) WHERE deleted_at IS NULL;
