package com.adminpersonal.shared.notification.event;

import java.time.LocalDateTime;
import java.util.UUID;

public record TaskReviewStalledEvent(UUID taskId, UUID userId, String taskTitle, LocalDateTime lastUpdatedAt) {
}
