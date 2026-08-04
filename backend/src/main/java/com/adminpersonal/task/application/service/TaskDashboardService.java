package com.adminpersonal.task.application.service;

import com.adminpersonal.task.application.dto.response.TaskDashboardResponse;
import com.adminpersonal.task.application.mapper.TaskMapper;
import com.adminpersonal.task.domain.enums.TaskPriority;
import com.adminpersonal.task.domain.model.Task;
import com.adminpersonal.task.infrastructure.persistence.TaskRepository;
import com.adminpersonal.task.infrastructure.persistence.spec.TaskSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class TaskDashboardService {

    private final TaskRepository taskRepository;
    private final TaskMapper mapper;

    @Transactional(readOnly = true)
    public TaskDashboardResponse getDashboardSummary(UUID userId) {
        LocalDate today = LocalDate.now();
        LocalDateTime reviewThreshold = LocalDateTime.now().minusHours(48);

        Specification<Task> highPrioritySpec = TaskSpecification.forUser(userId)
            .and((root, q, cb) -> cb.and(
                root.get("priority").in(TaskPriority.HIGH),
                root.get("status").in("PENDING", "READY")
            ));

        List<Task> highPriority = taskRepository.findAll(highPrioritySpec,
            Sort.by("dueDate").ascending()).stream().limit(10).toList();

        List<Task> dueItems = taskRepository.findDueOnDate(userId, today);
        List<Task> dueTomorrow = taskRepository.findDueOnDate(userId, today.plusDays(1));
        List<Task> combined = Stream.concat(dueItems.stream(), dueTomorrow.stream())
            .distinct().toList();

        List<Task> stalled = taskRepository.findStalledInReviewByUserId(userId, reviewThreshold)
            .stream().limit(10).toList();

        long totalActive = taskRepository.countActiveByUserId(userId);
        long totalCompleted = taskRepository.countCompletedByUserId(userId);

        return new TaskDashboardResponse(
            highPriority.stream().map(mapper::toSummaryResponse).toList(),
            combined.stream().map(mapper::toSummaryResponse).toList(),
            stalled.stream().map(mapper::toSummaryResponse).toList(),
            totalActive,
            totalCompleted
        );
    }
}
