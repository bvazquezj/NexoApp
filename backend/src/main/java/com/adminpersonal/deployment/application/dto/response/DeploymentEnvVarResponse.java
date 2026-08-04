package com.adminpersonal.deployment.application.dto.response;

import com.adminpersonal.deployment.domain.enums.EnvVarType;
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
public class DeploymentEnvVarResponse {
    private UUID id;
    private UUID deploymentId;
    private String key;
    /** Masked as "********" when type == SECRET; otherwise the raw (still-encrypted-at-rest) value passthrough. */
    private String value;
    private EnvVarType type;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
