package com.adminpersonal.task.infrastructure.web;

import com.adminpersonal.shared.security.SecurityUtils;
import com.adminpersonal.task.application.dto.response.AiSubtasksResponse;
import com.adminpersonal.task.application.service.TaskAiService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/tasks/{id}/ai")
@Tag(name = "Task AI", description = "Generación de subtareas con IA")
@RequiredArgsConstructor
public class TaskAiController {

    private final TaskAiService aiService;

    @PostMapping("/subtasks")
    @Operation(summary = "Generar sugerencias de subtareas con IA")
    @ApiResponse(responseCode = "200", description = "Sugerencias generadas")
    @ApiResponse(responseCode = "503", description = "Servicio de IA no disponible")
    public ResponseEntity<AiSubtasksResponse> generateSubtasks(@PathVariable UUID id) {
        return ResponseEntity.ok(aiService.generateSubtasks(SecurityUtils.getCurrentUserId(), id));
    }
}
