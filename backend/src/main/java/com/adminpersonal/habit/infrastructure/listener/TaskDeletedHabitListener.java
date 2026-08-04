package com.adminpersonal.habit.infrastructure.listener;

import com.adminpersonal.habit.application.service.BlockTaskLinkService;
import com.adminpersonal.shared.notification.event.TaskDeletedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

/**
 * Cuando una tarea se elimina (soft delete), limpia todos los BlockTaskLink que la referencian.
 * Mantiene el módulo Hábitos consistente sin acoplar Tasks a Habits.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class TaskDeletedHabitListener {

    private final BlockTaskLinkService blockTaskLinkService;

    @EventListener
    public void onTaskDeleted(TaskDeletedEvent event) {
        int removed = blockTaskLinkService.deleteByTaskId(event.taskId());
        if (removed > 0) {
            log.debug("Cleaned up {} BlockTaskLink(s) for deleted taskId={}", removed, event.taskId());
        }
    }
}
