package com.adminpersonal.habit.application.dto.response;

import com.adminpersonal.habit.domain.enums.ExecutionSource;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoutineExecutionLogResponse {
    private UUID id;
    private UUID routineBlockId;
    private LocalDate date;
    private LocalTime actualStartTime;
    private LocalTime actualEndTime;
    private boolean completed;
    private ExecutionSource source;
    private String notes;
}
