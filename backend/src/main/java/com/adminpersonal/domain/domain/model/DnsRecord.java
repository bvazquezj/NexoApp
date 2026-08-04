package com.adminpersonal.domain.domain.model;

import com.adminpersonal.domain.domain.enums.DnsRecordType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "dns_records", indexes = {
    @Index(name = "idx_dns_records_domain", columnList = "domain_id")
})
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class DnsRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "domain_id", nullable = false)
    private Domain domain;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private DnsRecordType type;

    @Column(nullable = false, length = 255)
    private String host;

    @Column(name = "expected_value", nullable = false, columnDefinition = "text")
    private String expectedValue;

    @Column
    private Integer ttl;

    @Column
    private Integer priority;

    @Column(name = "resolved_value", columnDefinition = "text")
    private String resolvedValue;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @Builder.Default
    @Column(name = "has_mismatch", nullable = false)
    private boolean hasMismatch = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
