package com.adminpersonal.project.domain.model;

import com.adminpersonal.project.domain.enums.TechCategory;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "project_techs", indexes = {
    @Index(name = "idx_project_techs_project", columnList = "project_id")
}, uniqueConstraints = {
    @UniqueConstraint(name = "uq_project_techs_project_name", columnNames = {"project_id", "name"})
})
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class ProjectTech {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(nullable = false, length = 100)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TechCategory category;
}
