package com.adminpersonal.habit.application.dto.response;

import com.adminpersonal.habit.domain.enums.BlockPriority;
import com.adminpersonal.habit.domain.enums.BlockType;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalTime;
import java.util.UUID;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoutineBlockResponse {
    private UUID id;
    private UUID routineDayId;
    private String title;
    private LocalTime startTime;
    private LocalTime endTime;
    private BlockType type;
    private UUID habitId;
    private String habitName;
    private BlockPriority priority;
    @JsonProperty("isFlexible")
    private boolean flexible;
    private int orderIndex;
    private String color;
    private boolean notifyStart;
    private boolean notifyEnd;
    private Integer notifyMinutesBefore;
}
