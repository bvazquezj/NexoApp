package com.adminpersonal.deployment.application.service;

import com.adminpersonal.deployment.application.dto.response.DeploymentMetricsResponse;
import com.adminpersonal.deployment.application.dto.response.UptimeTimelineResponse;
import com.adminpersonal.deployment.domain.enums.HealthCheckResult;
import com.adminpersonal.deployment.domain.model.DeploymentHealthCheck;
import com.adminpersonal.deployment.infrastructure.persistence.DeploymentHealthCheckRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Calcula métricas de salud y timeline para visualización en frontend.
 * Spec §F11+F12 — uptime 24h/7d/30d, latencia promedio + p95, último incidente.
 */
@Service
@RequiredArgsConstructor
public class DeploymentMetricsService {

    private final DeploymentHealthCheckRepository healthCheckRepository;
    private final DeploymentService deploymentService;

    @Transactional(readOnly = true)
    public DeploymentMetricsResponse getMetrics(UUID userId, UUID deploymentId) {
        deploymentService.ownedDeployment(userId, deploymentId);

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime from30d = now.minusDays(30);
        List<DeploymentHealthCheck> checks30d = healthCheckRepository.findByDeploymentAndDateRange(
            deploymentId, from30d, now);

        if (checks30d.isEmpty()) {
            return DeploymentMetricsResponse.builder()
                .totalChecks30d(0L)
                .build();
        }

        List<DeploymentHealthCheck> checks24h = checks30d.stream()
            .filter(c -> c.getCheckedAt().isAfter(now.minusHours(24))).toList();
        List<DeploymentHealthCheck> checks7d = checks30d.stream()
            .filter(c -> c.getCheckedAt().isAfter(now.minusDays(7))).toList();

        Double uptime24h = checks24h.isEmpty() ? null : computeUptime(checks24h);
        Double uptime7d = checks7d.isEmpty() ? null : computeUptime(checks7d);
        Double uptime30d = computeUptime(checks30d);

        Integer avgLatency = computeAvgLatency(checks24h);
        Integer p95Latency = computeP95Latency(checks24h);

        DeploymentMetricsResponse.LastIncident lastIncident = findLastIncident(checks30d);

        return DeploymentMetricsResponse.builder()
            .uptime24h(uptime24h)
            .uptime7d(uptime7d)
            .uptime30d(uptime30d)
            .avgLatencyMs24h(avgLatency)
            .p95LatencyMs24h(p95Latency)
            .totalChecks30d((long) checks30d.size())
            .lastIncident(lastIncident)
            .build();
    }

    @Transactional(readOnly = true)
    public UptimeTimelineResponse getUptimeTimeline(UUID userId, UUID deploymentId, LocalDateTime from, LocalDateTime to) {
        deploymentService.ownedDeployment(userId, deploymentId);

        List<DeploymentHealthCheck> checks = healthCheckRepository.findByDeploymentAndDateRange(deploymentId, from, to);
        // Agrupar por hora (truncate al inicio de hora)
        Map<LocalDateTime, List<DeploymentHealthCheck>> byHour = new LinkedHashMap<>();
        for (DeploymentHealthCheck c : checks) {
            LocalDateTime hour = c.getCheckedAt().truncatedTo(ChronoUnit.HOURS);
            byHour.computeIfAbsent(hour, k -> new ArrayList<>()).add(c);
        }

        List<UptimeTimelineResponse.TimelineBucket> buckets = new ArrayList<>();
        for (Map.Entry<LocalDateTime, List<DeploymentHealthCheck>> entry : byHour.entrySet()) {
            HealthCheckResult worst = worstResult(entry.getValue());
            buckets.add(new UptimeTimelineResponse.TimelineBucket(entry.getKey(), worst, entry.getValue().size()));
        }

        return UptimeTimelineResponse.builder()
            .deploymentId(deploymentId)
            .buckets(buckets)
            .build();
    }

    private double computeUptime(List<DeploymentHealthCheck> checks) {
        long up = checks.stream().filter(c -> c.getResult() == HealthCheckResult.UP).count();
        return Math.round((double) up / checks.size() * 10000.0) / 100.0;
    }

    private Integer computeAvgLatency(List<DeploymentHealthCheck> checks) {
        List<Integer> latencies = checks.stream()
            .map(DeploymentHealthCheck::getResponseTimeMs)
            .filter(java.util.Objects::nonNull)
            .toList();
        if (latencies.isEmpty()) return null;
        long total = latencies.stream().mapToLong(Integer::longValue).sum();
        return (int) (total / latencies.size());
    }

    private Integer computeP95Latency(List<DeploymentHealthCheck> checks) {
        List<Integer> sorted = checks.stream()
            .map(DeploymentHealthCheck::getResponseTimeMs)
            .filter(java.util.Objects::nonNull)
            .sorted()
            .toList();
        if (sorted.isEmpty()) return null;
        int idx = (int) Math.ceil(0.95 * sorted.size()) - 1;
        return sorted.get(Math.max(0, Math.min(idx, sorted.size() - 1)));
    }

    /**
     * Encuentra el último bloque consecutivo de DOWN/TIMEOUT.
     * Retorna inicio = primer check del bloque, recuperación = primer UP post-bloque (null si no hay).
     */
    private DeploymentMetricsResponse.LastIncident findLastIncident(List<DeploymentHealthCheck> checks30d) {
        // Ordenar ASC por checkedAt
        List<DeploymentHealthCheck> sorted = checks30d.stream()
            .sorted(Comparator.comparing(DeploymentHealthCheck::getCheckedAt))
            .toList();

        LocalDateTime lastDownStart = null;
        LocalDateTime lastDownRecovery = null;
        boolean inDownBlock = false;
        LocalDateTime currentBlockStart = null;

        for (DeploymentHealthCheck c : sorted) {
            boolean isBad = c.getResult() == HealthCheckResult.DOWN || c.getResult() == HealthCheckResult.TIMEOUT;
            if (isBad && !inDownBlock) {
                inDownBlock = true;
                currentBlockStart = c.getCheckedAt();
            } else if (!isBad && inDownBlock) {
                // Bloque cerrado
                lastDownStart = currentBlockStart;
                lastDownRecovery = c.getCheckedAt();
                inDownBlock = false;
            }
        }
        // Bloque abierto al final
        if (inDownBlock && currentBlockStart != null) {
            lastDownStart = currentBlockStart;
            lastDownRecovery = null;
        }

        if (lastDownStart == null) return null;
        Long durationMin = lastDownRecovery != null
            ? Duration.between(lastDownStart, lastDownRecovery).toMinutes()
            : null;
        return new DeploymentMetricsResponse.LastIncident(lastDownStart, lastDownRecovery, durationMin);
    }

    private HealthCheckResult worstResult(List<DeploymentHealthCheck> checks) {
        // Orden de peor: DOWN > TIMEOUT > DEGRADED > UP
        boolean hasDown = false, hasTimeout = false, hasDegraded = false;
        for (DeploymentHealthCheck c : checks) {
            switch (c.getResult()) {
                case DOWN -> hasDown = true;
                case TIMEOUT -> hasTimeout = true;
                case DEGRADED -> hasDegraded = true;
                case UP -> {}
            }
        }
        if (hasDown) return HealthCheckResult.DOWN;
        if (hasTimeout) return HealthCheckResult.TIMEOUT;
        if (hasDegraded) return HealthCheckResult.DEGRADED;
        return HealthCheckResult.UP;
    }
}
