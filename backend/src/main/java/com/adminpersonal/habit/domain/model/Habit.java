package com.adminpersonal.habit.domain.model;

import com.adminpersonal.auth.domain.model.User;
import com.adminpersonal.habit.domain.enums.HabitFrequency;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "habits")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class Habit {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private HabitCategory category;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 500)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private HabitFrequency frequency;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "frequency_days", columnDefinition = "integer[]")
    private Integer[] frequencyDays;

    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    @Column(nullable = false, length = 7)
    private String color;

    @Column(length = 50)
    private String icon;

    @Builder.Default
    @Column(name = "current_streak", nullable = false)
    private int currentStreak = 0;

    @Builder.Default
    @Column(name = "max_streak", nullable = false)
    private int maxStreak = 0;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
