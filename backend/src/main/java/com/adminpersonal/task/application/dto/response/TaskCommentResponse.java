package com.adminpersonal.task.application.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;

public record TaskCommentResponse(UUID id, String body, boolean closingComment, LocalDateTime createdAt) {}
