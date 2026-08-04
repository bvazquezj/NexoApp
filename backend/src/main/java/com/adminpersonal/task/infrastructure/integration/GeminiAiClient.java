package com.adminpersonal.task.infrastructure.integration;

import com.adminpersonal.task.application.dto.response.SubtaskSuggestionResponse;
import com.adminpersonal.task.domain.enums.TaskPriority;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Component
public class GeminiAiClient {

    @Value("${app.ai.gemini.api-key:}")
    private String apiKey;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newBuilder()
        .connectTimeout(Duration.ofSeconds(15))
        .build();

    public List<SubtaskSuggestionResponse> generateSubtasks(String prompt) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new RuntimeException("Gemini API key not configured");
        }

        String requestBody = """
            {"contents":[{"parts":[{"text":"%s"}]}]}
            """.formatted(prompt.replace("\"", "\\\"").replace("\n", "\\n"));

        try {
            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .timeout(Duration.ofSeconds(15))
                .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() != 200) {
                throw new RuntimeException("Gemini returned HTTP " + response.statusCode());
            }

            return parseResponse(response.body());
        } catch (Exception e) {
            throw new RuntimeException("Gemini request failed: " + e.getMessage(), e);
        }
    }

    private List<SubtaskSuggestionResponse> parseResponse(String rawJson) {
        try {
            JsonNode root = objectMapper.readTree(rawJson);
            String text = root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();
            JsonNode suggestions = objectMapper.readTree(text.trim());
            List<SubtaskSuggestionResponse> result = new ArrayList<>();
            for (JsonNode node : suggestions) {
                String title = node.path("title").asText();
                TaskPriority priority = TaskPriority.valueOf(node.path("priority").asText("MEDIUM"));
                result.add(new SubtaskSuggestionResponse(title, priority));
                if (result.size() >= 10) break;
            }
            return result;
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse Gemini response", e);
        }
    }
}
