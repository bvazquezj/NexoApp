package com.adminpersonal.domain.domain.model;

import com.adminpersonal.deployment.domain.model.Deployment;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
    name = "subdomains",
    indexes = {
        @Index(name = "idx_subdomains_domain",     columnList = "domain_id"),
        @Index(name = "idx_subdomains_deployment", columnList = "deployment_id")
    },
    uniqueConstraints = {
        @UniqueConstraint(name = "uq_subdomain_prefix", columnNames = {"domain_id", "prefix"})
    }
)
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class Subdomain {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "domain_id", nullable = false)
    private Domain domain;

    @Column(nullable = false, length = 63)
    private String prefix;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "deployment_id")
    private Deployment deployment;

    @Column(length = 500)
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
