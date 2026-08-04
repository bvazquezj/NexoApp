package com.adminpersonal.auth.application.dto.response;

public record AuthResponse(
    String accessToken,
    String refreshToken,
    Integer expiresIn,
    UserProfileResponse user,
    Boolean requiresVerification,
    String message
) {}
