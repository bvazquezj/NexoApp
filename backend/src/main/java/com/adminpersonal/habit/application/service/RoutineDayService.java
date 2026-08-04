package com.adminpersonal.habit.application.service;

import com.adminpersonal.auth.domain.model.User;
import com.adminpersonal.auth.infrastructure.persistence.UserRepository;
import com.adminpersonal.habit.application.dto.request.CopyRoutineRequest;
import com.adminpersonal.habit.application.dto.request.CreateRoutineDayRequest;
import com.adminpersonal.habit.application.dto.request.UpdateRoutineDayRequest;
import com.adminpersonal.habit.application.dto.response.RoutineBlockResponse;
import com.adminpersonal.habit.application.dto.response.RoutineDayResponse;
import com.adminpersonal.habit.application.mapper.RoutineBlockMapper;
import com.adminpersonal.habit.application.mapper.RoutineDayMapper;
import com.adminpersonal.habit.domain.exception.RoutineDayConflictException;
import com.adminpersonal.habit.domain.model.RoutineBlock;
import com.adminpersonal.habit.domain.model.RoutineDay;
import com.adminpersonal.habit.infrastructure.persistence.RoutineBlockRepository;
import com.adminpersonal.habit.infrastructure.persistence.RoutineDayRepository;
import com.adminpersonal.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RoutineDayService {

    private final RoutineDayRepository dayRepository;
    private final RoutineBlockRepository blockRepository;
    private final UserRepository userRepository;
    private final RoutineDayMapper dayMapper;
    private final RoutineBlockMapper blockMapper;

    @Transactional(readOnly = true)
    public List<RoutineDayResponse> findAll(UUID userId) {
        return dayRepository.findAllByUser(userId).stream()
            .map(d -> dayMapper.toResponse(d, blocksFor(d.getId())))
            .toList();
    }

    @Transactional(readOnly = true)
    public RoutineDayResponse findById(UUID userId, UUID dayId) {
        RoutineDay day = ownedDay(userId, dayId);
        return dayMapper.toResponse(day, blocksFor(dayId));
    }

    @Transactional
    public RoutineDayResponse create(UUID userId, CreateRoutineDayRequest req) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        // Si ya existe rutina activa para ese día, desactivarla (regla del spec)
        dayRepository.findActiveByUserAndDayOfWeek(userId, req.dayOfWeek())
            .ifPresent(existing -> {
                existing.setActive(false);
                dayRepository.save(existing);
            });

        RoutineDay day = RoutineDay.builder()
            .user(user)
            .dayOfWeek(req.dayOfWeek())
            .name(req.name())
            .active(true)
            .build();
        RoutineDay saved = dayRepository.save(day);
        return dayMapper.toResponse(saved, List.of());
    }

    @Transactional
    public RoutineDayResponse update(UUID userId, UUID dayId, UpdateRoutineDayRequest req) {
        RoutineDay day = ownedDay(userId, dayId);
        if (req.name() != null) day.setName(req.name());
        if (req.active() != null) {
            if (req.active() && !day.isActive()) {
                // Activar este: desactivar otros del mismo dayOfWeek
                dayRepository.findActiveByUserAndDayOfWeek(userId, day.getDayOfWeek())
                    .filter(other -> !other.getId().equals(dayId))
                    .ifPresent(other -> {
                        other.setActive(false);
                        dayRepository.save(other);
                    });
            }
            day.setActive(req.active());
        }
        return dayMapper.toResponse(dayRepository.save(day), blocksFor(dayId));
    }

    @Transactional
    public void delete(UUID userId, UUID dayId) {
        RoutineDay day = ownedDay(userId, dayId);
        // Cascade delete configurado en FK de routine_blocks (ON DELETE CASCADE).
        dayRepository.delete(day);
    }

    /**
     * Copia una rutina a otro día de la semana. Crea un nuevo RoutineDay y duplica
     * todos sus bloques (NO copia BlockTaskLinks — las tareas son específicas al momento).
     * Si replace=true y existe rutina activa en el día destino, la desactiva.
     */
    @Transactional
    public RoutineDayResponse copyRoutine(UUID userId, UUID sourceId, CopyRoutineRequest req) {
        RoutineDay source = ownedDay(userId, sourceId);
        Integer targetDow = req.targetDayOfWeek();

        // Manejar conflicto en día destino
        dayRepository.findActiveByUserAndDayOfWeek(userId, targetDow)
            .ifPresent(existing -> {
                if (Boolean.TRUE.equals(req.replace())) {
                    existing.setActive(false);
                    dayRepository.save(existing);
                } else {
                    throw new RoutineDayConflictException(
                        "Ya existe una rutina activa para el día " + targetDow + ". Usa replace=true para reemplazarla.");
                }
            });

        RoutineDay copy = RoutineDay.builder()
            .user(source.getUser())
            .dayOfWeek(targetDow)
            .name(source.getName() + " (copia)")
            .active(true)
            .templateName(source.getTemplateName())
            .build();
        RoutineDay savedCopy = dayRepository.save(copy);

        List<RoutineBlock> sourceBlocks = blockRepository.findByRoutineDay(sourceId);
        for (RoutineBlock src : sourceBlocks) {
            RoutineBlock newBlock = RoutineBlock.builder()
                .routineDay(savedCopy)
                .title(src.getTitle())
                .startTime(src.getStartTime())
                .endTime(src.getEndTime())
                .type(src.getType())
                .habit(src.getHabit())
                .priority(src.getPriority())
                .flexible(src.isFlexible())
                .orderIndex(src.getOrderIndex())
                .color(src.getColor())
                .notifyStart(src.isNotifyStart())
                .notifyEnd(src.isNotifyEnd())
                .notifyMinutesBefore(src.getNotifyMinutesBefore())
                .build();
            blockRepository.save(newBlock);
        }

        return dayMapper.toResponse(savedCopy, blocksFor(savedCopy.getId()));
    }

    private List<RoutineBlockResponse> blocksFor(UUID dayId) {
        return blockRepository.findByRoutineDay(dayId).stream()
            .map(blockMapper::toResponse)
            .toList();
    }

    public RoutineDay ownedDay(UUID userId, UUID dayId) {
        return dayRepository.findByIdAndUserId(dayId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Rutina no encontrada: " + dayId));
    }
}
