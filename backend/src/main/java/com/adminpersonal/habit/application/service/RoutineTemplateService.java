package com.adminpersonal.habit.application.service;

import com.adminpersonal.auth.domain.model.User;
import com.adminpersonal.auth.infrastructure.persistence.UserRepository;
import com.adminpersonal.habit.application.dto.request.ApplyTemplateRequest;
import com.adminpersonal.habit.application.dto.request.CreateTemplateFromRoutineRequest;
import com.adminpersonal.habit.application.dto.response.RoutineDayResponse;
import com.adminpersonal.habit.application.dto.response.RoutineTemplateResponse;
import com.adminpersonal.habit.application.mapper.RoutineTemplateMapper;
import com.adminpersonal.habit.domain.enums.BlockPriority;
import com.adminpersonal.habit.domain.enums.BlockType;
import com.adminpersonal.habit.domain.exception.TemplateNotApplicableException;
import com.adminpersonal.habit.domain.model.RoutineBlock;
import com.adminpersonal.habit.domain.model.RoutineDay;
import com.adminpersonal.habit.domain.model.RoutineTemplate;
import com.adminpersonal.habit.infrastructure.persistence.RoutineBlockRepository;
import com.adminpersonal.habit.infrastructure.persistence.RoutineTemplateRepository;
import com.adminpersonal.shared.exception.ResourceNotFoundException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RoutineTemplateService {

    private final RoutineTemplateRepository templateRepository;
    private final RoutineBlockRepository blockRepository;
    private final RoutineDayService routineDayService;
    private final UserRepository userRepository;
    private final RoutineTemplateMapper templateMapper;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public List<RoutineTemplateResponse> findAll(UUID userId) {
        return templateRepository.findAllForUser(userId).stream()
            .map(templateMapper::toResponse)
            .toList();
    }

    /**
     * Crea una plantilla a partir de los bloques de una rutina existente.
     * Serializa los bloques como JSONB. NO almacena habitId — solo habitName como referencia.
     */
    @Transactional
    public RoutineTemplateResponse createFromRoutine(UUID userId, CreateTemplateFromRoutineRequest req) {
        RoutineDay source = routineDayService.ownedDay(userId, req.routineDayId());
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        List<RoutineBlock> blocks = blockRepository.findByRoutineDay(source.getId());
        List<Map<String, Object>> serialized = blocks.stream().map(b -> {
            java.util.LinkedHashMap<String, Object> m = new java.util.LinkedHashMap<>();
            m.put("title", b.getTitle());
            m.put("startTime", b.getStartTime() != null ? b.getStartTime().toString() : null);
            m.put("endTime", b.getEndTime() != null ? b.getEndTime().toString() : null);
            m.put("type", b.getType() != null ? b.getType().name() : null);
            m.put("habitName", b.getHabit() != null ? b.getHabit().getName() : null);
            m.put("priority", b.getPriority() != null ? b.getPriority().name() : null);
            m.put("isFlexible", b.isFlexible());
            m.put("color", b.getColor());
            m.put("notifyStart", b.isNotifyStart());
            m.put("notifyEnd", b.isNotifyEnd());
            m.put("notifyMinutesBefore", b.getNotifyMinutesBefore());
            return (Map<String, Object>) m;
        }).toList();

        String blocksJson;
        try {
            blocksJson = objectMapper.writeValueAsString(serialized);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Error serializando bloques de la plantilla", e);
        }

        RoutineTemplate template = RoutineTemplate.builder()
            .name(req.name())
            .description(req.description())
            .system(false)
            .user(user)
            .blocks(blocksJson)
            .build();

        return templateMapper.toResponse(templateRepository.save(template));
    }

    /**
     * Aplica una plantilla a una rutina existente. Por defecto AGREGA bloques (no reemplaza),
     * salvo que `replace=true`. Los bloques se crean con habit=null porque la plantilla solo
     * referencia habitName (string), no IDs.
     */
    @Transactional
    public RoutineDayResponse applyTemplate(UUID userId, UUID templateId, ApplyTemplateRequest req) {
        RoutineTemplate template = templateRepository.findByIdAccessibleByUser(templateId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Plantilla no encontrada: " + templateId));
        RoutineDay day = routineDayService.ownedDay(userId, req.routineDayId());

        List<Map<String, Object>> blocks;
        try {
            blocks = objectMapper.readValue(template.getBlocks(),
                new TypeReference<List<Map<String, Object>>>() {});
        } catch (JsonProcessingException e) {
            throw new TemplateNotApplicableException("La plantilla tiene un formato inválido");
        }

        if (Boolean.TRUE.equals(req.replace())) {
            List<RoutineBlock> existing = blockRepository.findByRoutineDay(day.getId());
            blockRepository.deleteAll(existing);
        }

        int orderStart = blockRepository.findMaxOrderIndex(day.getId()) + 1;
        for (int i = 0; i < blocks.size(); i++) {
            Map<String, Object> b = blocks.get(i);
            RoutineBlock newBlock = RoutineBlock.builder()
                .routineDay(day)
                .title(asString(b.get("title")))
                .startTime(parseTime(asString(b.get("startTime"))))
                .endTime(parseTime(asString(b.get("endTime"))))
                .type(parseEnum(BlockType.class, asString(b.get("type"))))
                .habit(null) // plantilla solo referencia habitName, el usuario debe vincularlo después
                .priority(parseEnum(BlockPriority.class, asString(b.get("priority"))))
                .flexible(Boolean.TRUE.equals(b.get("isFlexible")))
                .orderIndex(orderStart + i)
                .color(asString(b.get("color")))
                .notifyStart(b.get("notifyStart") == null || Boolean.TRUE.equals(b.get("notifyStart")))
                .notifyEnd(b.get("notifyEnd") == null || Boolean.TRUE.equals(b.get("notifyEnd")))
                .notifyMinutesBefore(b.get("notifyMinutesBefore") instanceof Number n ? n.intValue() : 10)
                .build();

            // Skip blocks de tipo HABIT (no podemos resolver habitId — el usuario debe crearlos manualmente)
            if (newBlock.getType() == BlockType.HABIT) continue;

            blockRepository.save(newBlock);
        }

        return routineDayService.findById(userId, day.getId());
    }

    @Transactional
    public void delete(UUID userId, UUID templateId) {
        RoutineTemplate template = templateRepository.findById(templateId)
            .orElseThrow(() -> new ResourceNotFoundException("Plantilla no encontrada: " + templateId));
        if (template.isSystem()) {
            throw new AccessDeniedException("Las plantillas del sistema no pueden eliminarse");
        }
        if (template.getUser() == null || !template.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Plantilla no encontrada: " + templateId);
        }
        templateRepository.delete(template);
    }

    private static String asString(Object o) {
        return o == null ? null : o.toString();
    }

    private static LocalTime parseTime(String s) {
        return s == null ? null : LocalTime.parse(s);
    }

    private static <E extends Enum<E>> E parseEnum(Class<E> enumClass, String value) {
        if (value == null) return null;
        try {
            return Enum.valueOf(enumClass, value);
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}
