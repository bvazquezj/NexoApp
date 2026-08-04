package com.adminpersonal.deployment.application.dto.response;

import lombok.Builder;

import java.time.LocalDateTime;
@Builder
public record DeploymentMetricsResponse(
    Double uptime24h,
    Double uptime7d,
    Double uptime30d,
    Integer avgLatencyMs24h,
    Integer p95LatencyMs24h,
    Long totalChecks30d,
    LastIncident lastIncident
) {
    @Builder
    public record LastIncident(
        LocalDateTime startedAt,
        LocalDateTime recoveredAt,
        Long durationMinutes
    ) {}
}
