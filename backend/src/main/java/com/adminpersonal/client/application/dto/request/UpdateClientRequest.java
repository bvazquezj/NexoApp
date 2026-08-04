package com.adminpersonal.client.application.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public record UpdateClientRequest(
    @Size(max = 150) String name,
    @Email @Size(max = 255) String email,
    @Size(max = 50) String phone,
    @Size(max = 150) String company,
    String website,
    @Size(max = 1000) String notes
) {}
