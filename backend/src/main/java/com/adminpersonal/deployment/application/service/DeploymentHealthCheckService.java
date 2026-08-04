package com.adminpersonal.deployment.application.service;

import com.adminpersonal.deployment.domain.enums.DeploymentStatus;
import com.adminpersonal.deployment.domain.enums.HealthCheckResult;
import com.adminpersonal.deployment.domain.model.Deployment;
import com.adminpersonal.deployment.domain.model.DeploymentHealthCheck;
import com.adminpersonal.deployment.infrastructure.persistence.DeploymentHealthCheckRepository;
import com.adminpersonal.deployment.infrastructure.persistence.DeploymentRepository;
import com.adminpersonal.shared.notification.NotificationEventPublisher;
import com.adminpersonal.shared.notification.event.DeploymentDegradedEvent;
import com.adminpersonal.shared.notification.event.DeploymentDownEvent;
import com.adminpersonal.shared.notification.event.DeploymentRecoveredEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Health check executor con anti-flapping basado en últimos 5 checks.
 *
 * Anti-flapping rules:
 * - Si último check = UP → status = ACTIVE
 * - Si >= 2 de los últimos 5 son DEGRADED/DOWN/TIMEOUT pero último no es DOWN → DEGRADED
 * - Si último = DOWN o TIMEOUT → DOWN
 *
 * Eventos publicados al cambiar status (con cooldown de 1h en lastEmailSentAt):
 * - → DOWN: DeploymentDownEvent
 * - DOWN|DEGRADED → ACTIVE: DeploymentRecoveredEvent
 * - → DEGRADED: DeploymentDegradedEvent
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DeploymentHealthCheckService {

    private static final int HC_TIMEOUT_SECONDS = 10;
    private static final int DEGRADED_LATENCY_MS = 3000;
    private static final int ANTI_FLAPPING_WINDOW = 5;
    private static final int ANTI_FLAPPING_BAD_THRESHOLD = 2;
    private static final long EMAIL_COOLDOWN_MINUTES = 60;

    private final DeploymentRepository deploymentRepository;
    private final DeploymentHealthCheckRepository healthCheckRepository;
    private final NotificationEventPublisher eventPublisher;

    private final HttpClient httpClient = HttpClient.newBuilder()
        .connectTimeout(Duration.ofSeconds(5))
        .followRedirects(HttpClient.Redirect.NORMAL)
        .build();

    @Transactional
    public void executeCheck(Deployment deployment) {
        if (!deployment.isHealthCheckEnabled() || deployment.getStatus() == DeploymentStatus.INACTIVE) {
            return;
        }

        LocalDateTime now = LocalDateTime.now();
        long startMs = System.currentTimeMillis();
        HealthCheckResult result;
        Integer httpCode = null;
        Integer responseTime = null;
        String errorMessage = null;

        try {
            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(deployment.getUrl()))
                .timeout(Duration.ofSeconds(HC_TIMEOUT_SECONDS))
                .GET()
                .build();
            HttpResponse<Void> response = httpClient.send(request, HttpResponse.BodyHandlers.discarding());
            responseTime = (int) (System.currentTimeMillis() - startMs);
            httpCode = response.statusCode();
            if (httpCode >= 200 && httpCode < 300) {
                result = (responseTime > DEGRADED_LATENCY_MS) ? HealthCheckResult.DEGRADED : HealthCheckResult.UP;
            } else {
                result = HealthCheckResult.DOWN;
            }
        } catch (java.net.http.HttpTimeoutException e) {
            result = HealthCheckResult.TIMEOUT;
            errorMessage = "Timeout tras " + HC_TIMEOUT_SECONDS + "s";
        } catch (Exception e) {
            result = HealthCheckResult.DOWN;
            errorMessage = truncate(e.getMessage(), 500);
        }

        DeploymentHealthCheck check = DeploymentHealthCheck.builder()
            .deployment(deployment)
            .result(result)
            .httpStatusCode(httpCode)
            .responseTimeMs(responseTime)
            .error(errorMessage)
            .checkedAt(now)
            .build();
        healthCheckRepository.save(check);

        deployment.setLastHealthCheckAt(now);
        evaluateAndUpdateStatus(deployment, result);
        deploymentRepository.save(deployment);
    }

    /**
     * Evalúa status con anti-flapping y publica eventos si cambia el status.
     */
    private void evaluateAndUpdateStatus(Deployment deployment, HealthCheckResult latestResult) {
        DeploymentStatus oldStatus = deployment.getStatus();
        List<DeploymentHealthCheck> recent = healthCheckRepository.findLastNByDeployment(
            deployment.getId(), PageRequest.of(0, ANTI_FLAPPING_WINDOW));

        long badCount = recent.stream()
            .filter(c -> c.getResult() == HealthCheckResult.DEGRADED
                || c.getResult() == HealthCheckResult.DOWN
                || c.getResult() == HealthCheckResult.TIMEOUT)
            .count();

        DeploymentStatus newStatus;
        if (latestResult == HealthCheckResult.UP) {
            newStatus = DeploymentStatus.ACTIVE;
        } else if (latestResult == HealthCheckResult.DOWN || latestResult == HealthCheckResult.TIMEOUT) {
            newStatus = DeploymentStatus.DOWN;
        } else {
            // DEGRADED actual: aplica si hay >= 2 malos en ventana
            newStatus = (badCount >= ANTI_FLAPPING_BAD_THRESHOLD) ? DeploymentStatus.DEGRADED : DeploymentStatus.ACTIVE;
        }

        deployment.setStatus(newStatus);

        if (oldStatus == newStatus) return;

        boolean cooldownExpired = deployment.getLastEmailSentAt() == null
            || deployment.getLastEmailSentAt().isBefore(LocalDateTime.now().minusMinutes(EMAIL_COOLDOWN_MINUTES));

        if (newStatus == DeploymentStatus.DOWN && deployment.isNotifyOnDown() && cooldownExpired) {
            eventPublisher.publish(new DeploymentDownEvent(
                deployment.getId(), deployment.getUser().getId(), deployment.getName(), deployment.getUrl()));
            deployment.setLastEmailSentAt(LocalDateTime.now());
        } else if (newStatus == DeploymentStatus.ACTIVE
            && (oldStatus == DeploymentStatus.DOWN || oldStatus == DeploymentStatus.DEGRADED)
            && deployment.isNotifyOnRecovery()) {
            eventPublisher.publish(new DeploymentRecoveredEvent(
                deployment.getId(), deployment.getUser().getId(), deployment.getName(), deployment.getUrl()));
        } else if (newStatus == DeploymentStatus.DEGRADED && deployment.isNotifyOnDegraded() && cooldownExpired) {
            eventPublisher.publish(new DeploymentDegradedEvent(
                deployment.getId(), deployment.getUser().getId(), deployment.getName(), deployment.getUrl()));
            deployment.setLastEmailSentAt(LocalDateTime.now());
        }

        log.debug("Deployment {} status changed: {} → {}", deployment.getId(), oldStatus, newStatus);
    }

    private String truncate(String s, int max) {
        if (s == null) return null;
        return s.length() <= max ? s : s.substring(0, max);
    }
}
