package com.adminpersonal.domain.domain.model;

import com.adminpersonal.domain.domain.enums.CheckTrigger;
import com.adminpersonal.domain.domain.enums.DomainCheckResult;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "domain_checks", indexes = {
    @Index(name = "idx_domain_checks_domain_checked", columnList = "domain_id, checked_at DESC")
})
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class DomainCheck {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "domain_id", nullable = false)
    private Domain domain;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private DomainCheckResult result;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "resolved_ips", columnDefinition = "jsonb")
    private String resolvedIps;

    @Builder.Default
    @Column(name = "mismatch_count", nullable = false)
    private Integer mismatchCount = 0;

    @Column(name = "error_message", length = 500)
    private String errorMessage;

    @Enumerated(EnumType.STRING)
    @Column(name = "triggered_by", nullable = false, length = 20)
    private CheckTrigger triggeredBy;

    @Column(name = "checked_at", nullable = false)
    private LocalDateTime checkedAt;
}
