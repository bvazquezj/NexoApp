package com.adminpersonal.habit.application.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoutineDayResponse {
    private UUID id;
    private Integer dayOfWeek;
    private String name;
    @JsonProperty("isActive")
    private boolean active;
    private String templateName;
    private LocalDateTime createdAt;
    private List<RoutineBlockResponse> blocks;
}
