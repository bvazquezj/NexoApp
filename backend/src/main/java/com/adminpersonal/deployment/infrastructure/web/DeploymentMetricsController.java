package com.adminpersonal.deployment.infrastructure.web;

import com.adminpersonal.deployment.application.dto.response.DeploymentMetricsResponse;
import com.adminpersonal.deployment.application.dto.response.UptimeTimelineResponse;
import com.adminpersonal.deployment.application.service.DeploymentMetricsService;
import com.adminpersonal.shared.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/api/deployments/{deploymentId}")
@Tag(name = "Deployment Metrics", description = "Uptime, latencia y timeline de health checks")
@RequiredArgsConstructor
public class DeploymentMetricsController {

    private final DeploymentMetricsService service;

    @GetMapping("/metrics")
    @Operation(summary = "Métricas de uptime/latencia (24h, 7d, 30d) + último incidente")
    public ResponseEntity<DeploymentMetricsResponse> getMetrics(@PathVariable UUID deploymentId) {
        return ResponseEntity.ok(service.getMetrics(SecurityUtils.getCurrentUserId(), deploymentId));
    }

    @GetMapping("/timeline")
    @Operation(summary = "Timeline de health checks agrupado por hora (rango from..to)")
    public ResponseEntity<UptimeTimelineResponse> getTimeline(
        @PathVariable UUID deploymentId,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to
    ) {
        return ResponseEntity.ok(service.getUptimeTimeline(SecurityUtils.getCurrentUserId(), deploymentId, from, to));
    }
}
