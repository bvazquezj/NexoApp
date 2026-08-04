package com.adminpersonal.deployment.application.dto.request;

import com.adminpersonal.deployment.domain.enums.EnvVarType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateEnvVarRequest(
    @NotBlank @Size(max = 200) String key,
    @NotBlank String value,
    @NotNull EnvVarType type
) {}
