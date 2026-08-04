package com.adminpersonal.deployment.domain.model;

import com.adminpersonal.deployment.domain.enums.DeployRecordSource;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "deployment_records", indexes = {
    @Index(name = "idx_deployment_records_deployment", columnList = "deployment_id, deployed_at DESC")
})
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class DeploymentRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "deployment_id", nullable = false)
    private Deployment deployment;

    @Column(nullable = false, columnDefinition = "text")
    private String url;

    @Column(length = 200)
    private String branch;

    @Column(length = 100)
    private String version;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private DeployRecordSource source;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "webhook_payload", columnDefinition = "jsonb")
    private String webhookPayload;

    @Column(length = 500)
    private String notes;

    @Column(name = "deployed_at", nullable = false)
    private LocalDateTime deployedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
