package com.adminpersonal.shared.notification;

import com.adminpersonal.auth.domain.model.User;
import com.adminpersonal.auth.infrastructure.persistence.UserRepository;
import com.adminpersonal.shared.exception.ResourceNotFoundException;
import com.adminpersonal.shared.notification.dto.NotificationResponse;
import com.adminpersonal.shared.notification.model.Notification;
import com.adminpersonal.shared.notification.persistence.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SseEmitterManager emitterManager;

    @Transactional
    public NotificationResponse create(UUID userId, String type, String title, String message, String metadata) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        Notification n = Notification.builder()
            .user(user)
            .type(type)
            .title(title)
            .message(message)
            .read(false)
            .metadata(metadata)
            .build();
        Notification saved = notificationRepository.save(n);
        NotificationResponse response = toResponse(saved);
        emitterManager.send(userId, response);
        return response;
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> findAll(UUID userId) {
        return notificationRepository.findAllByUser(userId).stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> findUnread(UUID userId) {
        return notificationRepository.findUnreadByUser(userId).stream().map(this::toResponse).toList();
    }

    @Transactional
    public void markRead(UUID userId, UUID notificationId) {
        Notification n = notificationRepository.findById(notificationId)
            .orElseThrow(() -> new ResourceNotFoundException("Notificación no encontrada: " + notificationId));
        if (!n.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("No tienes acceso a esta notificación");
        }
        n.setRead(true);
        notificationRepository.save(n);
    }

    @Transactional
    public int markAllRead(UUID userId) {
        return notificationRepository.markAllAsRead(userId);
    }

    private NotificationResponse toResponse(Notification n) {
        return NotificationResponse.builder()
            .id(n.getId())
            .type(n.getType())
            .title(n.getTitle())
            .message(n.getMessage())
            .read(n.isRead())
            .metadata(n.getMetadata())
            .createdAt(n.getCreatedAt())
            .build();
    }
}
