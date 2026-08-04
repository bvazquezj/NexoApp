package com.adminpersonal.deployment.application.dto.response;

import com.adminpersonal.deployment.domain.enums.HealthCheckResult;
import lombok.Builder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Builder
public record UptimeTimelineResponse(
    UUID deploymentId,
    List<TimelineBucket> buckets
) {
    /** Una barra de la timeline. {@code result} es el peor estado observado en la hora. */
    public record TimelineBucket(
        LocalDateTime hour,
        HealthCheckResult result,
        int totalChecks
    ) {}
}
