package com.adminpersonal.deployment.application.dto.response;

import com.adminpersonal.deployment.domain.enums.EnvVarType;

import java.util.UUID;

public record EnvVarRevealResponse(
    UUID id,
    String key,
    String value,
    EnvVarType type
) {}
