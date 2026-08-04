package com.adminpersonal.client.application.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClientResponse {
    private UUID id;
    private String name;
    private String email;
    private String phone;
    private String company;
    private String website;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    // Aggregated counts (queries adicionales)
    private long domainCount;
    private long projectCount;
    private long taskCount;
    private long deploymentCount;
}
