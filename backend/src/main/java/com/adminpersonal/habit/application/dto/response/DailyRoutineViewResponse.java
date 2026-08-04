package com.adminpersonal.habit.application.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DailyRoutineViewResponse {
    private UUID routineDayId;
    private Integer dayOfWeek;
    private LocalDate date;
    private List<BlockExecutionItem> items;

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BlockExecutionItem {
        private RoutineBlockResponse block;
        private RoutineExecutionLogResponse execution;
    }
}
