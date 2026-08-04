package com.adminpersonal.habit.application.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HabitSummaryResponse {
    private UUID id;
    private String name;
    private String color;
    private String icon;
    private HabitCategoryResponse category;
    @JsonProperty("isActive")
    private boolean isActive;
    private int currentStreak;
}
