package com.adminpersonal.deployment.application.dto.request;

import com.adminpersonal.deployment.domain.enums.EnvVarType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ImportEnvVarsRequest(
    @NotBlank String content,
    @NotNull EnvVarType defaultType
) {}
