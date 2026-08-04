package com.adminpersonal.domain.domain.model;

import com.adminpersonal.domain.domain.enums.DomainAlertType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "domain_alert_logs", indexes = {
    @Index(name = "idx_domain_alert_logs_cycle", columnList = "domain_id, alert_type, sent_at DESC")
})
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class DomainAlertLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "domain_id", nullable = false)
    private Domain domain;

    @Enumerated(EnumType.STRING)
    @Column(name = "alert_type", nullable = false, length = 25)
    private DomainAlertType alertType;

    @Column(name = "sent_at", nullable = false)
    private LocalDateTime sentAt;
}
