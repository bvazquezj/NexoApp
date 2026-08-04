package com.adminpersonal.habit.infrastructure.web;

import com.adminpersonal.habit.application.dto.request.CreateRoutineBlockRequest;
import com.adminpersonal.habit.application.dto.request.LogExecutionRequest;
import com.adminpersonal.habit.application.dto.request.ReorderBlocksRequest;
import com.adminpersonal.habit.application.dto.request.UpdateRoutineBlockRequest;
import com.adminpersonal.habit.application.dto.response.DailyRoutineViewResponse;
import com.adminpersonal.habit.application.dto.response.RoutineBlockResponse;
import com.adminpersonal.habit.application.dto.response.RoutineExecutionLogResponse;
import com.adminpersonal.habit.application.service.RoutineBlockService;
import com.adminpersonal.habit.application.service.RoutineExecutionService;
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
import java.util.UUID;

@RestController
@RequestMapping("/api/routines/{routineId}")
@Tag(name = "Routine Blocks", description = "Bloques de tiempo y ejecución")
@RequiredArgsConstructor
public class RoutineBlockController {

    private final RoutineBlockService blockService;
    private final RoutineExecutionService executionService;

    @PostMapping("/blocks")
    @Operation(summary = "Crear bloque dentro de la rutina")
    @ApiResponse(responseCode = "201", description = "Bloque creado")
    @ApiResponse(responseCode = "400", description = "Datos inválidos")
    @ApiResponse(responseCode = "409", description = "Solapamiento con otro bloque")
    public ResponseEntity<RoutineBlockResponse> createBlock(
        @PathVariable UUID routineId,
        @Valid @RequestBody CreateRoutineBlockRequest req
    ) {
        RoutineBlockResponse created = blockService.create(SecurityUtils.getCurrentUserId(), routineId, req);
        return ResponseEntity.status(201).body(created);
    }

    @PutMapping("/blocks/{blockId}")
    @Operation(summary = "Actualizar bloque (valida no-overlap si cambian horarios)")
    @ApiResponse(responseCode = "200", description = "Bloque actualizado")
    @ApiResponse(responseCode = "409", description = "Solapamiento con otro bloque")
    public ResponseEntity<RoutineBlockResponse> updateBlock(
        @PathVariable UUID routineId,
        @PathVariable UUID blockId,
        @Valid @RequestBody UpdateRoutineBlockRequest req
    ) {
        return ResponseEntity.ok(blockService.update(SecurityUtils.getCurrentUserId(), blockId, req));
    }

    @DeleteMapping("/blocks/{blockId}")
    @Operation(summary = "Eliminar bloque")
    @ApiResponse(responseCode = "204", description = "Bloque eliminado")
    public ResponseEntity<Void> deleteBlock(
        @PathVariable UUID routineId,
        @PathVariable UUID blockId
    ) {
        blockService.delete(SecurityUtils.getCurrentUserId(), blockId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/blocks/reorder")
    @Operation(summary = "Reordenar bloques de la rutina (lista de IDs en nuevo orden)")
    @ApiResponse(responseCode = "204", description = "Orden actualizado")
    public ResponseEntity<Void> reorderBlocks(
        @PathVariable UUID routineId,
        @Valid @RequestBody ReorderBlocksRequest req
    ) {
        blockService.reorder(SecurityUtils.getCurrentUserId(), routineId, req);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/execution")
    @Operation(summary = "Vista de ejecución del día (bloques + logs)")
    @ApiResponse(responseCode = "200", description = "Vista diaria")
    public ResponseEntity<DailyRoutineViewResponse> getDailyExecution(
        @PathVariable UUID routineId,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        LocalDate effectiveDate = date != null ? date : LocalDate.now();
        return ResponseEntity.ok(
            executionService.getDailyView(SecurityUtils.getCurrentUserId(), routineId, effectiveDate));
    }

    @PostMapping("/blocks/{blockId}/execution")
    @Operation(summary = "Registrar ejecución de un bloque (upsert por fecha)")
    @ApiResponse(responseCode = "200", description = "Ejecución registrada")
    public ResponseEntity<RoutineExecutionLogResponse> logExecution(
        @PathVariable UUID routineId,
        @PathVariable UUID blockId,
        @Valid @RequestBody LogExecutionRequest req
    ) {
        return ResponseEntity.ok(
            executionService.logExecution(SecurityUtils.getCurrentUserId(), blockId, req));
    }
}
