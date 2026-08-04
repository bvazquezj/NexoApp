package com.adminpersonal.task.infrastructure.web;

import com.adminpersonal.shared.security.SecurityUtils;
import com.adminpersonal.task.application.dto.response.TaskCommentResponse;
import com.adminpersonal.task.application.service.TaskCommentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/tasks/{taskId}/comments")
@Tag(name = "Task Comments", description = "Comentarios de tarea")
@RequiredArgsConstructor
public class TaskCommentController {

    private final TaskCommentService commentService;

    @GetMapping
    @Operation(summary = "Listar comentarios de una tarea")
    public ResponseEntity<List<TaskCommentResponse>> list(@PathVariable UUID taskId) {
        return ResponseEntity.ok(commentService.findByTask(SecurityUtils.getCurrentUserId(), taskId));
    }
}
