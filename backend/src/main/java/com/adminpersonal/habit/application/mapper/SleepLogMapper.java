package com.adminpersonal.habit.application.mapper;

import com.adminpersonal.habit.application.dto.response.SleepLogResponse;
import com.adminpersonal.habit.domain.model.SleepLog;
import org.springframework.stereotype.Component;

@Component
public class SleepLogMapper {

    public SleepLogResponse toResponse(SleepLog log) {
        if (log == null) return null;
        return SleepLogResponse.builder()
            .id(log.getId())
            .date(log.getDate())
            .sleepStart(log.getSleepStart())
            .sleepEnd(log.getSleepEnd())
            .durationMinutes(log.getDurationMinutes())
            .source(log.getSource())
            .syncedAt(log.getSyncedAt())
            .build();
    }
}
