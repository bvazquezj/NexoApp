package com.adminpersonal.deployment.domain.model;

import com.adminpersonal.deployment.domain.enums.HealthCheckResult;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "deployment_health_checks", indexes = {
    @Index(name = "idx_health_checks_deployment_checked", columnList = "deployment_id, checked_at DESC")
})
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class DeploymentHealthCheck {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "deployment_id", nullable = false)
    private Deployment deployment;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private HealthCheckResult result;

    @Column(name = "http_status_code")
    private Integer httpStatusCode;

    @Column(name = "response_time_ms")
    private Integer responseTimeMs;

    @Column(length = 500)
    private String error;

    @Column(name = "checked_at", nullable = false)
    private LocalDateTime checkedAt;
}
