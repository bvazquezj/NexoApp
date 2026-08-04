package com.adminpersonal.deployment.domain.model;

import com.adminpersonal.deployment.domain.enums.EnvVarType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "deployment_env_vars")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class DeploymentEnvVar {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "deployment_id", nullable = false)
    private Deployment deployment;

    @Column(name = "key", nullable = false, length = 200)
    private String key;

    @Column(nullable = false, columnDefinition = "text")
    private String value;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private EnvVarType type;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
