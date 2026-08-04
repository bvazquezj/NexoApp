CREATE INDEX idx_domains_user_deleted ON domains (user_id, deleted_at);
CREATE INDEX idx_domains_client ON domains (client_id, deleted_at);
CREATE INDEX idx_domains_project ON domains (project_id, deleted_at);
CREATE INDEX idx_domains_expires ON domains (user_id, expires_at, status, deleted_at);
CREATE UNIQUE INDEX uq_domain_full_domain_user ON domains (user_id, full_domain) WHERE deleted_at IS NULL;
CREATE INDEX idx_domains_expires_alert ON domains (expires_at, status) WHERE status = 'ACTIVE' AND deleted_at IS NULL;

CREATE INDEX idx_domain_nameservers_domain ON domain_nameservers (domain_id) WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX uq_dns_record ON dns_records (domain_id, type, host, md5(expected_value));
CREATE INDEX idx_dns_records_domain ON dns_records (domain_id);

CREATE INDEX idx_subdomains_domain ON subdomains (domain_id);
CREATE INDEX idx_subdomains_deployment ON subdomains (deployment_id) WHERE deployment_id IS NOT NULL;

CREATE INDEX idx_domain_checks_domain_checked ON domain_checks (domain_id, checked_at DESC);
CREATE INDEX idx_domain_checks_cleanup ON domain_checks USING brin (checked_at);

CREATE INDEX idx_domain_alert_logs_cycle ON domain_alert_logs (domain_id, alert_type, sent_at DESC);
