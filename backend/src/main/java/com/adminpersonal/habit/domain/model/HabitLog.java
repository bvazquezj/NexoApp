package com.adminpersonal.habit.domain.model;

import com.adminpersonal.habit.domain.enums.LogSource;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "habit_logs",
    uniqueConstraints = {
        @UniqueConstraint(name = "uq_habit_logs_habit_date", columnNames = {"habit_id", "date"})
    },
    indexes = {
        @Index(name = "idx_habit_logs_habit_date", columnList = "habit_id, date DESC")
    }
)
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class HabitLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "habit_id", nullable = false)
    private Habit habit;

    @Column(nullable = false)
    private LocalDate date;

    @Builder.Default
    @Column(nullable = false)
    private boolean completed = true;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private LogSource source;
}
