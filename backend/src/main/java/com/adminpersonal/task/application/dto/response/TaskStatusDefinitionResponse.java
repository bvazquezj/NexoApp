package com.adminpersonal.task.application.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.UUID;

public record TaskStatusDefinitionResponse(
    UUID id,
    String name,
    String displayName,
    String color,
    int position,
    @JsonProperty("isSystem") boolean system
) {}
