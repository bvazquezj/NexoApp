package com.adminpersonal.habit.application.mapper;

import com.adminpersonal.habit.application.dto.response.RoutineExecutionLogResponse;
import com.adminpersonal.habit.domain.model.RoutineExecutionLog;
import org.springframework.stereotype.Component;

@Component
public class RoutineExecutionLogMapper {

    public RoutineExecutionLogResponse toResponse(RoutineExecutionLog log) {
        if (log == null) return null;
        return RoutineExecutionLogResponse.builder()
            .id(log.getId())
            .routineBlockId(log.getRoutineBlock() != null ? log.getRoutineBlock().getId() : null)
            .date(log.getDate())
            .actualStartTime(log.getActualStartTime())
            .actualEndTime(log.getActualEndTime())
            .completed(log.isCompleted())
            .source(log.getSource())
            .notes(log.getNotes())
            .build();
    }
}
