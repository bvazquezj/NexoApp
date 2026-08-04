ALTER TABLE tasks
    ADD CONSTRAINT fk_tasks_iteration
    FOREIGN KEY (iteration_id) REFERENCES project_iterations(id) ON DELETE SET NULL;
