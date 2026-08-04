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
public class HabitCategoryResponse {
    private UUID id;
    private String name;
    private String color;
    // @JsonProperty forces Jackson to use "isSystem" as key.
    // Without it, Lombok's isSystem() getter would serialize as "system".
    @JsonProperty("isSystem")
    private boolean isSystem;
}
