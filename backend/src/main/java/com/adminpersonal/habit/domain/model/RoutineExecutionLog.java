package com.adminpersonal.habit.domain.model;

import com.adminpersonal.habit.domain.enums.ExecutionSource;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

@Entity
@Table(name = "routine_execution_logs",
    uniqueConstraints = {
        @UniqueConstraint(name = "uq_routine_execution_block_date", columnNames = {"routine_block_id", "date"})
    },
    indexes = {
        @Index(name = "idx_routine_execution_block_date", columnList = "routine_block_id, date")
    }
)
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class RoutineExecutionLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "routine_block_id", nullable = false)
    private RoutineBlock routineBlock;

    @Column(nullable = false)
    private LocalDate date;

    @Column(name = "actual_start_time")
    private LocalTime actualStartTime;

    @Column(name = "actual_end_time")
    private LocalTime actualEndTime;

    @Builder.Default
    @Column(nullable = false)
    private boolean completed = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ExecutionSource source;

    @Column(length = 500)
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
