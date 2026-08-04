package com.adminpersonal.shared.notification.web;

import com.adminpersonal.shared.notification.NotificationService;
import com.adminpersonal.shared.notification.SseEmitterManager;
import com.adminpersonal.shared.notification.dto.NotificationResponse;
import com.adminpersonal.shared.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
@Tag(name = "Notifications", description = "Notificaciones in-app y stream SSE")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final SseEmitterManager emitterManager;

    @GetMapping
    @Operation(summary = "Listar todas las notificaciones del usuario")
    public ResponseEntity<List<NotificationResponse>> findAll() {
        return ResponseEntity.ok(notificationService.findAll(SecurityUtils.getCurrentUserId()));
    }

    @GetMapping("/unread")
    @Operation(summary = "Listar notificaciones no leídas")
    public ResponseEntity<List<NotificationResponse>> findUnread() {
        return ResponseEntity.ok(notificationService.findUnread(SecurityUtils.getCurrentUserId()));
    }

    @PostMapping("/{id}/read")
    @Operation(summary = "Marcar notificación como leída")
    public ResponseEntity<Void> markRead(@PathVariable UUID id) {
        notificationService.markRead(SecurityUtils.getCurrentUserId(), id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/read-all")
    @Operation(summary = "Marcar todas las notificaciones como leídas")
    public ResponseEntity<Void> markAllRead() {
        notificationService.markAllRead(SecurityUtils.getCurrentUserId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping(path = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @Operation(summary = "Stream SSE de notificaciones en tiempo real (timeout 5 min, reconectar)")
    public SseEmitter stream() {
        return emitterManager.register(SecurityUtils.getCurrentUserId());
    }
}
