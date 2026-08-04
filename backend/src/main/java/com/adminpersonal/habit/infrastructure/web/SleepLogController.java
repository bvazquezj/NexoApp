package com.adminpersonal.habit.infrastructure.web;

import com.adminpersonal.habit.application.dto.request.LogSleepRequest;
import com.adminpersonal.habit.application.dto.response.SleepLogResponse;
import com.adminpersonal.habit.application.service.SleepLogService;
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

@RestController
@RequestMapping("/api/sleep-logs")
@Tag(name = "Sleep Logs", description = "Registro de sueño (manual + futuro Samsung Health)")
@RequiredArgsConstructor
public class SleepLogController {

    private final SleepLogService sleepLogService;

    @PostMapping
    @Operation(summary = "Registrar sueño manualmente (upsert por fecha). Evalúa correlación con bloque SLEEP de la rutina del día.")
    @ApiResponse(responseCode = "200", description = "Sueño registrado")
    public ResponseEntity<SleepLogResponse> log(@Valid @RequestBody LogSleepRequest req) {
        return ResponseEntity.ok(sleepLogService.logManual(SecurityUtils.getCurrentUserId(), req));
    }

    @GetMapping
    @Operation(summary = "Listar logs de sueño en un rango")
    public ResponseEntity<List<SleepLogResponse>> findByDateRange(
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        return ResponseEntity.ok(sleepLogService.findByDateRange(SecurityUtils.getCurrentUserId(), from, to));
    }

    @GetMapping("/{date}")
    @Operation(summary = "Obtener log de sueño de una fecha")
    public ResponseEntity<SleepLogResponse> findByDate(
        @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        return sleepLogService.findByDate(SecurityUtils.getCurrentUserId(), date)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
}
