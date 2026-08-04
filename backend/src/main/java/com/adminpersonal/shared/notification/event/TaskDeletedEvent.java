package com.adminpersonal.shared.notification.event;

import java.util.UUID;

public record TaskDeletedEvent(UUID taskId, UUID userId) {
}
