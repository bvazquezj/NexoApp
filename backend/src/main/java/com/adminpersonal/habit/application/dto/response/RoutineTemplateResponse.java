package com.adminpersonal.habit.application.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoutineTemplateResponse {
    private UUID id;
    private String name;
    private String description;
    @JsonProperty("isSystem")
    private boolean system;
    private String blocks; // JSON serialized
    private LocalDateTime createdAt;
}
