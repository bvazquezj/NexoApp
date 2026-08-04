package com.adminpersonal.shared.notification.event;

import java.time.LocalDate;
import java.util.UUID;

public record TaskDueTodayEvent(UUID taskId, UUID userId, String taskTitle, LocalDate dueDate) {
}
