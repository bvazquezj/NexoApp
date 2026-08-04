package com.adminpersonal.deployment.application.mapper;

import com.adminpersonal.deployment.application.dto.response.DeploymentEnvVarResponse;
import com.adminpersonal.deployment.application.dto.response.EnvVarRevealResponse;
import com.adminpersonal.deployment.domain.enums.EnvVarType;
import com.adminpersonal.deployment.domain.model.DeploymentEnvVar;
import org.springframework.stereotype.Component;

@Component
public class DeploymentEnvVarMapper {

    private static final String MASKED_VALUE = "********";

    /**
     * Mapea la env var enmascarando el valor cuando {@code type == SECRET}.
     * Para valores PUBLIC se devuelve {@code getValue()} tal cual (que puede ser plaintext o
     * el almacenado en BD; la decisión de descifrar la toma el servicio antes de mapear).
     */
    public DeploymentEnvVarResponse toResponse(DeploymentEnvVar envVar) {
        String value = envVar.getType() == EnvVarType.SECRET ? MASKED_VALUE : envVar.getValue();
        return DeploymentEnvVarResponse.builder()
            .id(envVar.getId())
            .deploymentId(envVar.getDeployment() != null ? envVar.getDeployment().getId() : null)
            .key(envVar.getKey())
            .value(value)
            .type(envVar.getType())
            .createdAt(envVar.getCreatedAt())
            .updatedAt(envVar.getUpdatedAt())
            .build();
    }

    /** Reveal endpoint: expone el valor descifrado en claro. */
    public EnvVarRevealResponse toReveal(DeploymentEnvVar envVar, String decryptedValue) {
        return new EnvVarRevealResponse(
            envVar.getId(),
            envVar.getKey(),
            decryptedValue,
            envVar.getType()
        );
    }
}
