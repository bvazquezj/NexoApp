package com.adminpersonal.task.infrastructure.web;

import com.adminpersonal.shared.security.SecurityUtils;
import com.adminpersonal.task.application.dto.response.TaskDashboardResponse;
import com.adminpersonal.task.application.service.TaskDashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tasks/dashboard")
@Tag(name = "Task Dashboard", description = "Datos del dashboard de tareas")
@RequiredArgsConstructor
public class TaskDashboardController {

    private final TaskDashboardService dashboardService;

    @GetMapping
    @Operation(summary = "Obtener resumen del dashboard de tareas")
    public ResponseEntity<TaskDashboardResponse> getDashboard() {
        return ResponseEntity.ok(dashboardService.getDashboardSummary(SecurityUtils.getCurrentUserId()));
    }
}
