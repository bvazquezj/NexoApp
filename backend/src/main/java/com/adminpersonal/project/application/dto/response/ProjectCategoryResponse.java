package com.adminpersonal.project.application.dto.response;

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
public class ProjectCategoryResponse {
    private UUID id;
    private String name;
    private String color;
    @JsonProperty("isSystem")
    private boolean system;
}
