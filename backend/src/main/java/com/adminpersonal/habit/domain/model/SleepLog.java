package com.adminpersonal.habit.domain.model;

import com.adminpersonal.auth.domain.model.User;
import com.adminpersonal.habit.domain.enums.SleepSource;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "sleep_logs",
    uniqueConstraints = {
        @UniqueConstraint(name = "uq_sleep_logs_user_date", columnNames = {"user_id", "date"})
    },
    indexes = {
        @Index(name = "idx_sleep_logs_user_date", columnList = "user_id, date DESC")
    }
)
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class SleepLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private LocalDate date;

    @Column(name = "sleep_start", nullable = false)
    private LocalDateTime sleepStart;

    @Column(name = "sleep_end", nullable = false)
    private LocalDateTime sleepEnd;

    @Column(name = "duration_minutes", nullable = false)
    private Integer durationMinutes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SleepSource source;

    @CreationTimestamp
    @Column(name = "synced_at", nullable = false, updatable = false)
    private LocalDateTime syncedAt;
}
