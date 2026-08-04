package com.adminpersonal.domain.domain.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "domain_nameservers")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class DomainNameserver {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "domain_id", nullable = false)
    private Domain domain;

    @Column(nullable = false, length = 255)
    private String value;

    @Column(name = "order_index", nullable = false)
    private Integer orderIndex;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
}
