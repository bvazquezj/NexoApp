package com.adminpersonal.habit.domain.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "block_task_links",
    uniqueConstraints = {
        @UniqueConstraint(name = "uq_block_task_links_block_task", columnNames = {"routine_block_id", "task_id"})
    },
    indexes = {
        @Index(name = "idx_block_task_links_task", columnList = "task_id")
    }
)
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class BlockTaskLink {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "routine_block_id", nullable = false)
    private RoutineBlock routineBlock;

    @Column(name = "task_id", nullable = false)
    private UUID taskId;

    @CreationTimestamp
    @Column(name = "added_at", nullable = false, updatable = false)
    private LocalDateTime addedAt;
}
