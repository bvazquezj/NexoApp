package com.adminpersonal.deployment.application.dto.request;

/**
 * Public webhook payload (no auth — token in path).
 *
 * <p>All fields are optional; the controller/service decides which to honor.
 * The complete raw payload is serialized to JSON and persisted in
 * {@code deployment_records.webhook_payload} for auditing.</p>
 */
public record WebhookPayload(
    String url,
    String version,
    String branch,
    String status,
    String notes
) {}
