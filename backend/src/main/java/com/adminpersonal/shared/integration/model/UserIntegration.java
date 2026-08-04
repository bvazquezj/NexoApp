package com.adminpersonal.shared.integration.model;

import com.adminpersonal.auth.domain.model.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "user_integrations",
    uniqueConstraints = {
        @UniqueConstraint(name = "uq_user_integrations_user_provider", columnNames = {"user_id", "provider"})
    },
    indexes = {
        @Index(name = "idx_user_integrations_user_provider", columnList = "user_id, provider")
    }
)
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class UserIntegration {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 50)
    private String provider;

    @Column(name = "access_token_encrypted", columnDefinition = "TEXT")
    private String accessTokenEncrypted;

    @Column(name = "refresh_token_encrypted", columnDefinition = "TEXT")
    private String refreshTokenEncrypted;

    @Column(name = "token_expires_at")
    private LocalDateTime tokenExpiresAt;

    @Column(length = 500)
    private String scope;

    @Column(name = "last_synced_at")
    private LocalDateTime lastSyncedAt;

    @Builder.Default
    @Column(nullable = false, length = 20)
    private String status = "CONNECTED";

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
