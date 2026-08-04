package com.adminpersonal.deployment.domain.model;

import com.adminpersonal.auth.domain.model.User;
import com.adminpersonal.client.domain.model.Client;
import com.adminpersonal.deployment.domain.enums.DeploymentEnvironment;
import com.adminpersonal.deployment.domain.enums.DeploymentPlatform;
import com.adminpersonal.deployment.domain.enums.DeploymentStatus;
import com.adminpersonal.project.domain.model.Project;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "deployments", indexes = {
    @Index(name = "idx_deployments_user_deleted",   columnList = "user_id, deleted_at"),
    @Index(name = "idx_deployments_hook_token",     columnList = "hook_token"),
    @Index(name = "idx_deployments_project",        columnList = "project_id, deleted_at"),
    @Index(name = "idx_deployments_health_check",   columnList = "health_check_enabled, last_health_check_at, deleted_at"),
    @Index(name = "idx_deployments_status",         columnList = "user_id, status, deleted_at")
})
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class Deployment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id")
    private Client client;

    @Column(nullable = false, length = 100)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private DeploymentEnvironment environment;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private DeploymentPlatform platform;

    @Column(name = "platform_label", length = 50)
    private String platformLabel;

    @Column(nullable = false, columnDefinition = "text")
    private String url;

    @Column(name = "repo_url", columnDefinition = "text")
    private String repoUrl;

    @Column(length = 200)
    private String branch;

    @Column(length = 100)
    private String version;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(nullable = false, length = 20)
    private DeploymentStatus status = DeploymentStatus.UNKNOWN;

    @Column(name = "hook_token", unique = true, nullable = false, updatable = false)
    private UUID hookToken;

    @Builder.Default
    @Column(name = "health_check_enabled", nullable = false)
    private boolean healthCheckEnabled = true;

    @Builder.Default
    @Column(name = "health_check_interval_minutes", nullable = false)
    private Integer healthCheckIntervalMinutes = 5;

    @Builder.Default
    @Column(name = "notify_on_down", nullable = false)
    private boolean notifyOnDown = true;

    @Builder.Default
    @Column(name = "notify_on_recovery", nullable = false)
    private boolean notifyOnRecovery = true;

    @Builder.Default
    @Column(name = "notify_on_degraded", nullable = false)
    private boolean notifyOnDegraded = false;

    @Column(name = "last_email_sent_at")
    private LocalDateTime lastEmailSentAt;

    @Column(name = "platform_api_token_encrypted", columnDefinition = "text")
    private String platformApiTokenEncrypted;

    @Column(name = "platform_service_id", length = 200)
    private String platformServiceId;

    @Column(length = 500)
    private String notes;

    @Column(name = "last_deployed_at")
    private LocalDateTime lastDeployedAt;

    @Column(name = "last_health_check_at")
    private LocalDateTime lastHealthCheckAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
