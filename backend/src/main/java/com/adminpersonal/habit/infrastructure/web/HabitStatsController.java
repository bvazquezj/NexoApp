package com.adminpersonal.habit.infrastructure.web;

import com.adminpersonal.habit.application.dto.response.HabitHeatmapResponse;
import com.adminpersonal.habit.application.dto.response.HabitStatsResponse;
import com.adminpersonal.habit.application.service.HabitStatsService;
import com.adminpersonal.shared.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/habits/{habitId}")
@Tag(name = "Habit Stats", description = "Estadisticas y mapa de calor de cumplimiento de habitos")
@RequiredArgsConstructor
public class HabitStatsController {

    private final HabitStatsService habitStatsService;

    @GetMapping("/stats")
    @Operation(summary = "Estadisticas de cumplimiento del habito en los ultimos N dias (7, 30 o 90)")
    @ApiResponse(responseCode = "200", description = "Estadisticas calculadas")
    @ApiResponse(responseCode = "404", description = "Habito no encontrado")
    @ApiResponse(responseCode = "422", description = "Periodo invalido (debe ser 7, 30 o 90)")
    public ResponseEntity<HabitStatsResponse> getStats(
        @PathVariable UUID habitId,
        @RequestParam(defaultValue = "30") int period
    ) {
        UUID userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(habitStatsService.getStats(userId, habitId, period));
    }

    @GetMapping("/heatmap")
    @Operation(summary = "Mapa de calor de cumplimiento de los ultimos 90 dias")
    @ApiResponse(responseCode = "200", description = "Heatmap calculado")
    @ApiResponse(responseCode = "404", description = "Habito no encontrado")
    public ResponseEntity<HabitHeatmapResponse> getHeatmap(@PathVariable UUID habitId) {
        UUID userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(habitStatsService.getHeatmap(userId, habitId));
    }
}
