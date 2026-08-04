package com.adminpersonal.habit.application.dto.response;

import com.adminpersonal.habit.domain.enums.HabitFrequency;
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
public class HabitResponse {
    private UUID id;
    private String name;
    private String description;
    private String color;
    private String icon;
    private HabitCategoryResponse category;
    private HabitFrequency frequency;
    private Integer[] frequencyDays;
    // @JsonProperty forces Jackson to use "isActive" as key
    // (would otherwise serialize as "active" with the Lombok-generated isActive() getter).
    @JsonProperty("isActive")
    private boolean isActive;
    private int currentStreak;
    private int maxStreak;
    private LocalDateTime createdAt;
}
