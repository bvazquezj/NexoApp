package com.adminpersonal.task.application.dto.response;

import java.util.List;

public record TaskPageResponse(
    List<TaskResponse> content,
    int page,
    int size,
    long totalElements,
    int totalPages,
    boolean first,
    boolean last
) {}
