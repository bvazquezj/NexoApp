package com.adminpersonal.project.application.service;

import com.adminpersonal.task.infrastructure.persistence.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Calcula el progreso de un proyecto (% tareas completadas / total).
 *
 * Spec §F4 — Progreso automático basado en tareas:
 *   progreso = (tareas en COMPLETED / total de tareas vinculadas) × 100
 *   Si no hay tareas vinculadas → 0%
 *
 * Hook design: este servicio puede ser llamado por TaskService al cambiar el estado de una tarea
 * vinculada a un proyecto, para mantener el progreso actualizado. En esta versión v1 el progreso
 * se calcula on-demand (no se persiste en projects), evitando consistencia eventual.
 */
@Service
@RequiredArgsConstructor
public class ProjectProgressService {

    private final TaskRepository taskRepository;

    @Transactional(readOnly = true)
    public Progress calculate(UUID projectId) {
        long total = taskRepository.countByProjectId(projectId);
        long completed = taskRepository.countCompletedByProjectId(projectId);
        return new Progress(total, completed);
    }

    @Transactional(readOnly = true)
    public Progress calculateForIteration(UUID iterationId) {
        long total = taskRepository.countByIterationId(iterationId);
        long completed = taskRepository.countCompletedByIterationId(iterationId);
        return new Progress(total, completed);
    }

    public record Progress(long total, long completed) {
        public int percent() {
            return total > 0 ? (int) Math.round((double) completed / total * 100) : 0;
        }
    }
}
