package com.adminpersonal.deployment.application.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ConfigurePlatformApiRequest(
    @NotBlank String token,
    @Size(max = 200) String platformServiceId
) {}
