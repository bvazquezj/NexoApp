package com.adminpersonal.shared.notification.event;

import java.util.UUID;

public record DeploymentDegradedEvent(UUID deploymentId, UUID userId, String deploymentName, String url) {
}
