package com.adminpersonal.shared.notification.event;

import java.util.UUID;

public record DeploymentDownEvent(UUID deploymentId, UUID userId, String deploymentName, String url) {
}
