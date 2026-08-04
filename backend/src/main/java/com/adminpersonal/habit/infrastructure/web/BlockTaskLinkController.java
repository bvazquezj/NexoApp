package com.adminpersonal.habit.infrastructure.web;

import com.adminpersonal.habit.application.dto.request.LinkTaskToBlockRequest;
import com.adminpersonal.habit.application.dto.response.BlockTaskLinkResponse;
import com.adminpersonal.habit.application.service.BlockTaskLinkService;
import com.adminpersonal.shared.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/routines/blocks/{blockId}/tasks")
@Tag(name = "Block-Task Links", description = "Vinculación de tareas a bloques de rutina")
@RequiredArgsConstructor
public class BlockTaskLinkController {

    private final BlockTaskLinkService linkService;

    @GetMapping
    @Operation(summary = "Listar tareas vinculadas a un bloque (con su estado actual)")
    @ApiResponse(responseCode = "200", description = "Lista de vínculos")
    public ResponseEntity<List<BlockTaskLinkResponse>> findByBlock(@PathVariable UUID blockId) {
        return ResponseEntity.ok(linkService.findByBlock(SecurityUtils.getCurrentUserId(), blockId));
    }

    @PostMapping
    @Operation(summary = "Vincular una tarea al bloque (idempotente)")
    @ApiResponse(responseCode = "200", description = "Vínculo creado o existente")
    @ApiResponse(responseCode = "400", description = "Tarea en estado COMPLETED no vinculable")
    @ApiResponse(responseCode = "404", description = "Tarea o bloque no encontrado")
    public ResponseEntity<BlockTaskLinkResponse> link(
        @PathVariable UUID blockId,
        @Valid @RequestBody LinkTaskToBlockRequest req
    ) {
        return ResponseEntity.ok(linkService.create(SecurityUtils.getCurrentUserId(), blockId, req));
    }

    @DeleteMapping("/{linkId}")
    @Operation(summary = "Desvincular tarea del bloque")
    @ApiResponse(responseCode = "204", description = "Vínculo eliminado")
    public ResponseEntity<Void> unlink(
        @PathVariable UUID blockId,
        @PathVariable UUID linkId
    ) {
        linkService.delete(SecurityUtils.getCurrentUserId(), linkId);
        return ResponseEntity.noContent().build();
    }
}
