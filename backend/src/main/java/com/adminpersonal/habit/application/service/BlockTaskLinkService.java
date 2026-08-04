package com.adminpersonal.habit.application.service;

import com.adminpersonal.habit.application.dto.request.LinkTaskToBlockRequest;
import com.adminpersonal.habit.application.dto.response.BlockTaskLinkResponse;
import com.adminpersonal.habit.domain.model.BlockTaskLink;
import com.adminpersonal.habit.domain.model.RoutineBlock;
import com.adminpersonal.habit.infrastructure.persistence.BlockTaskLinkRepository;
import com.adminpersonal.shared.exception.ResourceNotFoundException;
import com.adminpersonal.task.domain.model.Task;
import com.adminpersonal.task.infrastructure.persistence.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Servicio que vincula tareas (módulo Tasks) a bloques de rutina.
 *
 * Diseño deliberado: BlockTaskLink.taskId es UUID SIN FK constraint a tasks.
 * Si la tarea referencia se elimina (soft delete), el link permanece pero el response
 * marcará taskAvailable=false. La limpieza masiva ocurre vía TaskDeletedEvent.
 */
@Service
@RequiredArgsConstructor
public class BlockTaskLinkService {

    private final BlockTaskLinkRepository linkRepository;
    private final TaskRepository taskRepository;
    private final RoutineBlockService routineBlockService;

    @Transactional(readOnly = true)
    public List<BlockTaskLinkResponse> findByBlock(UUID userId, UUID blockId) {
        // Validar ownership del bloque
        routineBlockService.ownedBlock(userId, blockId);

        List<BlockTaskLink> links = linkRepository.findByRoutineBlockId(blockId);
        if (links.isEmpty()) return List.of();

        // Carga batch de tareas referenciadas
        List<UUID> taskIds = links.stream().map(BlockTaskLink::getTaskId).toList();
        Map<UUID, Task> tasksById = taskRepository.findAllById(taskIds).stream()
            .filter(t -> t.getDeletedAt() == null) // soft-deleted = no disponible
            .filter(t -> t.getUser() != null && t.getUser().getId().equals(userId)) // solo tareas del usuario
            .collect(Collectors.toMap(Task::getId, t -> t));

        return links.stream().map(link -> toResponse(link, tasksById.get(link.getTaskId()))).toList();
    }

    /**
     * Vincula una tarea a un bloque. Solo permite tareas en estado PENDING/READY/REVIEW del usuario.
     * Si ya existe el link, devuelve el existente (idempotente).
     */
    @Transactional
    public BlockTaskLinkResponse create(UUID userId, UUID blockId, LinkTaskToBlockRequest req) {
        RoutineBlock block = routineBlockService.ownedBlock(userId, blockId);
        UUID taskId = req.taskId();

        // Validar que la tarea exista, sea del usuario, no eliminada, y esté en estado vinculable
        Task task = taskRepository.findByIdAndUserIdAndDeletedAtIsNull(taskId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Tarea no encontrada o no disponible: " + taskId));

        if ("COMPLETED".equals(task.getStatus())) {
            throw new IllegalArgumentException("No se pueden vincular tareas en estado COMPLETED");
        }

        // Idempotente: si ya existe el link, devolverlo
        BlockTaskLink existing = linkRepository.findByRoutineBlockIdAndTaskId(blockId, taskId).orElse(null);
        if (existing != null) {
            return toResponse(existing, task);
        }

        BlockTaskLink link = BlockTaskLink.builder()
            .routineBlock(block)
            .taskId(taskId)
            .build();
        return toResponse(linkRepository.save(link), task);
    }

    @Transactional
    public void delete(UUID userId, UUID linkId) {
        BlockTaskLink link = linkRepository.findByIdAndUserId(linkId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Vínculo no encontrado: " + linkId));
        linkRepository.delete(link);
    }

    /**
     * Limpieza masiva por TaskDeletedEvent. Llamado desde TaskDeletedHabitListener.
     */
    @Transactional
    public int deleteByTaskId(UUID taskId) {
        return linkRepository.deleteByTaskId(taskId);
    }

    private BlockTaskLinkResponse toResponse(BlockTaskLink link, Task task) {
        BlockTaskLinkResponse.BlockTaskLinkResponseBuilder builder = BlockTaskLinkResponse.builder()
            .id(link.getId())
            .routineBlockId(link.getRoutineBlock() != null ? link.getRoutineBlock().getId() : null)
            .taskId(link.getTaskId())
            .addedAt(link.getAddedAt());

        if (task == null) {
            return builder.taskAvailable(false).build();
        }
        return builder
            .taskAvailable(true)
            .taskTitle(task.getTitle())
            .taskStatus(task.getStatus())
            .taskPriority(task.getPriority())
            .build();
    }
}
