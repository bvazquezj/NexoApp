package com.adminpersonal.habit.infrastructure.scheduler;

import com.adminpersonal.habit.domain.model.RoutineBlock;
import com.adminpersonal.habit.domain.model.RoutineDay;
import com.adminpersonal.habit.infrastructure.persistence.RoutineBlockRepository;
import com.adminpersonal.habit.infrastructure.persistence.RoutineDayRepository;
import com.adminpersonal.shared.notification.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

/**
 * Scheduler que cada minuto evalúa los bloques de las rutinas activas y envía notificaciones
 * de "próximo a iniciar" (notifyMinutesBefore antes del startTime) y "terminado" (al endTime).
 *
 * Estrategia anti-duplicación: el cron corre cada minuto y dispara solo cuando la diferencia
 * entre el "trigger time" y "ahora" cae en una ventana de 60 segundos.
 *
 * NOTA: Para múltiples ejecuciones por minuto (rare en single-instance) o sistemas multi-tenant,
 * agregar tabla de tracking. v1 single-instance: aceptable.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class RoutineBlockNotificationScheduler {

    private final RoutineDayRepository routineDayRepository;
    private final RoutineBlockRepository blockRepository;
    private final NotificationService notificationService;

    @Scheduled(cron = "0 * * * * *")
    @Transactional(readOnly = true)
    public void checkBlockNotifications() {
        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now().withSecond(0).withNano(0);
        int dow = today.getDayOfWeek().getValue();
        int normalized = (dow == 7) ? 0 : dow;

        // Buscar todas las rutinas activas para el día actual de la semana
        List<RoutineDay> activeDays = routineDayRepository.findAll().stream()
            .filter(d -> d.isActive() && d.getDayOfWeek() != null && d.getDayOfWeek() == normalized)
            .toList();

        for (RoutineDay day : activeDays) {
            List<RoutineBlock> blocks = blockRepository.findByRoutineDay(day.getId());
            UUID userId = day.getUser().getId();
            for (RoutineBlock block : blocks) {
                evaluateBlock(userId, block, now, today);
            }
        }
    }

    private void evaluateBlock(UUID userId, RoutineBlock block, LocalTime now, LocalDate date) {
        // Notificación de inicio: notifyMinutesBefore antes del startTime
        if (block.isNotifyStart() && block.getStartTime() != null) {
            int minutesBefore = block.getNotifyMinutesBefore() != null ? block.getNotifyMinutesBefore() : 10;
            LocalTime triggerStart = block.getStartTime().minusMinutes(minutesBefore);
            if (now.equals(triggerStart)) {
                String metadata = String.format("{\"blockId\":\"%s\",\"date\":\"%s\"}", block.getId(), date);
                notificationService.create(
                    userId,
                    "BLOCK_STARTING",
                    "Tu bloque comienza en " + minutesBefore + " min",
                    block.getTitle() + " (" + block.getStartTime() + " - " + block.getEndTime() + ")",
                    metadata
                );
                log.debug("Sent BLOCK_STARTING notification for block {} to user {}", block.getId(), userId);
            }
        }

        // Notificación de fin: al endTime exacto
        if (block.isNotifyEnd() && block.getEndTime() != null && now.equals(block.getEndTime())) {
            String metadata = String.format("{\"blockId\":\"%s\",\"date\":\"%s\"}", block.getId(), date);
            notificationService.create(
                userId,
                "BLOCK_ENDED",
                "Tu bloque ha terminado",
                block.getTitle(),
                metadata
            );
            log.debug("Sent BLOCK_ENDED notification for block {} to user {}", block.getId(), userId);
        }
    }
}
