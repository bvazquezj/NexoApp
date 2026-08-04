package com.adminpersonal.auth.application.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;

public record UserProfileResponse(
    UUID id,
    String name,
    String email,
    boolean emailVerified,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
