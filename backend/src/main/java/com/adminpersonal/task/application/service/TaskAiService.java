package com.adminpersonal.task.application.service;

import com.adminpersonal.shared.exception.ResourceNotFoundException;
import com.adminpersonal.task.application.dto.response.AiSubtasksResponse;
import com.adminpersonal.task.application.dto.response.SubtaskSuggestionResponse;
import com.adminpersonal.task.domain.exception.AiServiceUnavailableException;
import com.adminpersonal.task.domain.model.Task;
import com.adminpersonal.task.infrastructure.integration.GeminiAiClient;
import com.adminpersonal.task.infrastructure.integration.GroqAiClient;
import com.adminpersonal.task.infrastructure.persistence.TaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class TaskAiService {

    private final TaskRepository taskRepository;
    private final GeminiAiClient geminiClient;
    private final GroqAiClient groqClient;

    public AiSubtasksResponse generateSubtasks(UUID userId, UUID taskId) {
        Task task = taskRepository.findByIdAndUserIdAndDeletedAtIsNull(taskId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Tarea no encontrada: " + taskId));

        String prompt = buildPrompt(task);

        try {
            List<SubtaskSuggestionResponse> suggestions = geminiClient.generateSubtasks(prompt);
            return new AiSubtasksResponse(taskId, "GEMINI", suggestions);
        } catch (Exception e) {
            log.warn("Gemini failed, falling back to Groq: {}", e.getMessage());
        }

        try {
            List<SubtaskSuggestionResponse> suggestions = groqClient.generateSubtasks(prompt);
            return new AiSubtasksResponse(taskId, "GROQ", suggestions);
        } catch (Exception e) {
            log.error("Both AI providers failed for task {}: {}", taskId, e.getMessage());
            throw new AiServiceUnavailableException("Servicio de IA no disponible temporalmente", e);
        }
    }

    private String buildPrompt(Task task) {
        return """
            You are a task breakdown assistant. Given a task title and description,
            generate a list of concrete subtasks needed to complete it.

            Task title: %s
            Task description: %s

            Return a JSON array of objects with exactly these fields:
            - "title": string (max 100 characters, actionable verb phrase)
            - "priority": "HIGH" | "MEDIUM" | "LOW"

            Return between 3 and 10 subtasks. Return only the JSON array, no explanation.
            """.formatted(task.getTitle(),
                task.getDescription() != null ? task.getDescription() : "No description provided");
    }
}
