package com.adminpersonal.deployment.application.dto.request;

import com.adminpersonal.deployment.domain.enums.EnvVarType;

public record UpdateEnvVarRequest(
    String value,
    EnvVarType type
) {}
