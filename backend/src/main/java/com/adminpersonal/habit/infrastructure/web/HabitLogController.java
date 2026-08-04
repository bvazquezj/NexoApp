package com.adminpersonal.habit.infrastructure.web;

import com.adminpersonal.habit.application.dto.request.LogHabitRequest;
import com.adminpersonal.habit.application.dto.response.HabitLogResponse;
import com.adminpersonal.habit.application.service.HabitLogService;
import com.adminpersonal.shared.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/habits/{habitId}/logs")
@Tag(name = "Habit Logs", description = "Registro y consulta de cumplimiento diario de habitos")
@RequiredArgsConstructor
public class HabitLogController {

    private final HabitLogService habitLogService;

    @PostMapping
    @Operation(summary = "Registrar (upsert) el cumplimiento de un habito en una fecha")
    @ApiResponse(responseCode = "200", description = "Log registrado o actualizado")
    @ApiResponse(responseCode = "400", description = "Datos invalidos")
    @ApiResponse(responseCode = "404", description = "Habito no encontrado")
    public ResponseEntity<HabitLogResponse> logHabit(
        @PathVariable UUID habitId,
        @Valid @RequestBody LogHabitRequest request
    ) {
        UUID userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(habitLogService.logHabit(userId, habitId, request));
    }

    @GetMapping
    @Operation(summary = "Listar logs del habito en un rango de fechas [from, to]")
    @ApiResponse(responseCode = "200", description = "Lista de logs en el rango")
    @ApiResponse(responseCode = "404", description = "Habito no encontrado")
    public ResponseEntity<List<HabitLogResponse>> findByDateRange(
        @PathVariable UUID habitId,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        UUID userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(habitLogService.findByHabitAndDateRange(userId, habitId, from, to));
    }
}
