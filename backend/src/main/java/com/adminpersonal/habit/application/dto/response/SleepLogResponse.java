package com.adminpersonal.habit.application.dto.response;

import com.adminpersonal.habit.domain.enums.SleepSource;
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
public class SleepLogResponse {
    private UUID id;
    private LocalDate date;
    private LocalDateTime sleepStart;
    private LocalDateTime sleepEnd;
    private Integer durationMinutes;
    private SleepSource source;
    private LocalDateTime syncedAt;
}
