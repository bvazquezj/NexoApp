package com.adminpersonal.task.domain.model;

import com.adminpersonal.auth.domain.model.User;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "task_status_definitions", indexes = {
    @Index(name = "idx_task_status_definitions_user", columnList = "user_id")
})
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class TaskStatusDefinition {

    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(name = "display_name", nullable = false, length = 100)
    private String displayName;

    @Column(nullable = false, length = 7)
    private String color;

    @Column(nullable = false)
    private int position;

    @Column(name = "is_system", nullable = false)
    private boolean system;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;
}
