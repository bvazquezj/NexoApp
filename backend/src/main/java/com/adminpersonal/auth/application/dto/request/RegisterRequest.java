package com.adminpersonal.auth.application.dto.request;

import jakarta.validation.constraints.*;

public record RegisterRequest(
    @NotBlank @Size(min = 2, max = 150) String name,
    @NotBlank @Email String email,
    @NotBlank @Size(min = 8, max = 100)
    @Pattern(regexp = ".*[A-Z].*", message = "Debe contener al menos una mayúscula")
    String password
) {}
