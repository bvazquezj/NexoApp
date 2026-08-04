package com.adminpersonal.project.domain.model;

import com.adminpersonal.project.domain.enums.TechCategory;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "tech_catalog")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class TechCatalog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 100, unique = true)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TechCategory category;
}
