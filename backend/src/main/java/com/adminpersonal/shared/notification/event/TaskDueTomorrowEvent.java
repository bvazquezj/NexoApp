package com.adminpersonal.shared.notification.event;

import java.time.LocalDate;
import java.util.UUID;

public record TaskDueTomorrowEvent(UUID taskId, UUID userId, String taskTitle, LocalDate dueDate) {
}
