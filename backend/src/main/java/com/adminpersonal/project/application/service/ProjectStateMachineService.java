package com.adminpersonal.project.application.service;

import com.adminpersonal.project.domain.enums.ProjectStatus;
import com.adminpersonal.project.domain.exception.InvalidProjectStateTransitionException;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Set;

/**
 * Máquina de estados del Project. Encapsula las transiciones permitidas según spec.
 * Spec §Flujo de Estados:
 *
 *   ACTIVE      → IN_PROGRESS, PAUSED, CANCELLED
 *   IN_PROGRESS → ACTIVE, PAUSED, COMPLETED, CANCELLED
 *   PAUSED      → ACTIVE, IN_PROGRESS
 *   COMPLETED   → ARCHIVED, ACTIVE (reactivar)
 *   CANCELLED   → ARCHIVED, ACTIVE (reactivar)
 *   ARCHIVED    → ACTIVE (restaurar)
 */
@Service
public class ProjectStateMachineService {

    private static final Map<ProjectStatus, Set<ProjectStatus>> TRANSITIONS = Map.of(
        ProjectStatus.ACTIVE,      Set.of(ProjectStatus.IN_PROGRESS, ProjectStatus.PAUSED, ProjectStatus.CANCELLED),
        ProjectStatus.IN_PROGRESS, Set.of(ProjectStatus.ACTIVE, ProjectStatus.PAUSED, ProjectStatus.COMPLETED, ProjectStatus.CANCELLED),
        ProjectStatus.PAUSED,      Set.of(ProjectStatus.ACTIVE, ProjectStatus.IN_PROGRESS),
        ProjectStatus.COMPLETED,   Set.of(ProjectStatus.ARCHIVED, ProjectStatus.ACTIVE),
        ProjectStatus.CANCELLED,   Set.of(ProjectStatus.ARCHIVED, ProjectStatus.ACTIVE),
        ProjectStatus.ARCHIVED,    Set.of(ProjectStatus.ACTIVE)
    );

    public boolean canTransition(ProjectStatus from, ProjectStatus to) {
        return TRANSITIONS.getOrDefault(from, Set.of()).contains(to);
    }

    public void validateTransition(ProjectStatus from, ProjectStatus to) {
        if (!canTransition(from, to)) {
            throw new InvalidProjectStateTransitionException(
                "Transición no permitida: " + from + " → " + to);
        }
    }
}
