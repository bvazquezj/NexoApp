package com.adminpersonal.deployment.application.dto.response;

import lombok.Builder;

import java.util.List;

@Builder
public record ImportEnvVarsResponse(
    int imported,
    int skipped,
    List<String> errors
) {}
