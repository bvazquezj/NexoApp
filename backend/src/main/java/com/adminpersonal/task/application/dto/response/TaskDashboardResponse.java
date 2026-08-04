package com.adminpersonal.task.application.dto.response;

import java.util.List;

public record TaskDashboardResponse(
    List<TaskSummaryResponse> highPriorityPending,
    List<TaskSummaryResponse> dueTodayOrTomorrow,
    List<TaskSummaryResponse> stalledInReview,
    long totalActive,
    long totalCompleted
) {}
