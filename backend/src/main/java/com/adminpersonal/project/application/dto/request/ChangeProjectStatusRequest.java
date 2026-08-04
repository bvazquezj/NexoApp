package com.adminpersonal.project.application.dto.request;

import com.adminpersonal.project.domain.enums.ProjectStatus;
import jakarta.validation.constraints.NotNull;

public record ChangeProjectStatusRequest(
    @NotNull ProjectStatus status
) {}
