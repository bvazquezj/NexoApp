package com.adminpersonal.habit.domain.model;

import com.adminpersonal.habit.domain.enums.BlockPriority;
import com.adminpersonal.habit.domain.enums.BlockType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalTime;
import java.util.UUID;

@Entity
@Table(name = "routine_blocks", indexes = {
    @Index(name = "idx_routine_blocks_day_order", columnList = "routine_day_id, order_index"),
    @Index(name = "idx_routine_blocks_notify",    columnList = "notify_start, start_time")
})
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class RoutineBlock {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "routine_day_id", nullable = false)
    private RoutineDay routineDay;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private BlockType type;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "habit_id")
    private Habit habit;

    @Enumerated(EnumType.STRING)
    @Column(length = 10)
    private BlockPriority priority;

    @Builder.Default
    @Column(name = "is_flexible", nullable = false)
    private boolean flexible = false;

    @Builder.Default
    @Column(name = "order_index", nullable = false)
    private int orderIndex = 0;

    @Column(length = 7)
    private String color;

    @Builder.Default
    @Column(name = "notify_start", nullable = false)
    private boolean notifyStart = true;

    @Builder.Default
    @Column(name = "notify_end", nullable = false)
    private boolean notifyEnd = true;

    @Builder.Default
    @Column(name = "notify_minutes_before", nullable = false)
    private Integer notifyMinutesBefore = 10;
}
