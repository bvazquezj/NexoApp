package com.adminpersonal.project.domain.model;

import com.adminpersonal.project.domain.enums.LinkType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "project_links", indexes = {
    @Index(name = "idx_project_links_project", columnList = "project_id")
})
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class ProjectLink {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private LinkType type;

    @Column(nullable = false, length = 100)
    private String label;

    @Column(nullable = false, length = 500)
    private String url;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
