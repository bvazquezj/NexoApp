CREATE INDEX idx_deployments_user_deleted ON deployments (user_id, deleted_at);
CREATE INDEX idx_deployments_hook_token ON deployments (hook_token);
CREATE INDEX idx_deployments_project ON deployments (project_id, deleted_at);
CREATE INDEX idx_deployments_health_check ON deployments (health_check_enabled, last_health_check_at, deleted_at);
CREATE INDEX idx_deployments_status ON deployments (user_id, status, deleted_at);

CREATE INDEX idx_deployment_records_deployment ON deployment_records (deployment_id, deployed_at DESC);

CREATE INDEX idx_health_checks_deployment_checked ON deployment_health_checks (deployment_id, checked_at DESC);
CREATE INDEX idx_health_checks_cleanup ON deployment_health_checks USING brin (checked_at);

CREATE INDEX idx_env_vars_deployment ON deployment_env_vars (deployment_id) WHERE deleted_at IS NULL;
