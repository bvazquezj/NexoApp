package com.adminpersonal.domain.domain.model;

import com.adminpersonal.auth.domain.model.User;
import com.adminpersonal.client.domain.model.Client;
import com.adminpersonal.domain.domain.enums.DnsProvider;
import com.adminpersonal.domain.domain.enums.DomainStatus;
import com.adminpersonal.domain.domain.enums.Registrar;
import com.adminpersonal.project.domain.model.Project;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "domains", indexes = {
    @Index(name = "idx_domains_user_deleted",  columnList = "user_id, deleted_at"),
    @Index(name = "idx_domains_client",        columnList = "client_id, deleted_at"),
    @Index(name = "idx_domains_project",       columnList = "project_id, deleted_at"),
    @Index(name = "idx_domains_expires",       columnList = "user_id, expires_at, status, deleted_at")
})
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class Domain {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id")
    private Client client;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 20)
    private String tld;

    @Column(name = "full_domain", nullable = false, length = 255)
    private String fullDomain;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Registrar registrar;

    @Column(name = "registrar_label", length = 50)
    private String registrarLabel;

    @Enumerated(EnumType.STRING)
    @Column(name = "dns_provider", length = 20)
    private DnsProvider dnsProvider;

    @Column(name = "dns_provider_label", length = 50)
    private String dnsProviderLabel;

    @Column(name = "registered_at")
    private LocalDate registeredAt;

    @Column(name = "expires_at", nullable = false)
    private LocalDate expiresAt;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(nullable = false, length = 20)
    private DomainStatus status = DomainStatus.ACTIVE;

    @Builder.Default
    @Column(name = "whois_privacy", nullable = false)
    private boolean whoisPrivacy = false;

    @Builder.Default
    @Column(name = "auto_renewal", nullable = false)
    private boolean autoRenewal = false;

    @Column(name = "renewal_price_amount", precision = 10, scale = 2)
    private BigDecimal renewalPriceAmount;

    @Column(name = "renewal_price_currency", length = 5)
    private String renewalPriceCurrency;

    @Column(columnDefinition = "text")
    private String notes;

    @Column(name = "last_checked_at")
    private LocalDateTime lastCheckedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
