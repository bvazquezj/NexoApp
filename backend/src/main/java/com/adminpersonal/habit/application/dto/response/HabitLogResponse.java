package com.adminpersonal.habit.application.dto.response;

import com.adminpersonal.habit.domain.enums.LogSource;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HabitLogResponse {
    private UUID id;
    private UUID habitId;
    private LocalDate date;
    private boolean completed;
    private LocalDateTime completedAt;
    private LogSource source;
}
