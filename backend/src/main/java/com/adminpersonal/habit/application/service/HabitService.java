package com.adminpersonal.habit.application.service;

import com.adminpersonal.auth.domain.model.User;
import com.adminpersonal.auth.infrastructure.persistence.UserRepository;
import com.adminpersonal.habit.application.dto.request.CreateHabitRequest;
import com.adminpersonal.habit.application.dto.request.UpdateHabitRequest;
import com.adminpersonal.habit.application.dto.response.HabitCategoryResponse;
import com.adminpersonal.habit.application.dto.response.HabitResponse;
import com.adminpersonal.habit.application.dto.response.HabitSummaryResponse;
import com.adminpersonal.habit.application.mapper.HabitCategoryMapper;
import com.adminpersonal.habit.application.mapper.HabitMapper;
import com.adminpersonal.habit.domain.enums.HabitFrequency;
import com.adminpersonal.habit.domain.exception.HabitNotFoundException;
import com.adminpersonal.habit.domain.model.Habit;
import com.adminpersonal.habit.domain.model.HabitCategory;
import com.adminpersonal.habit.infrastructure.persistence.HabitCategoryRepository;
import com.adminpersonal.habit.infrastructure.persistence.HabitRepository;
import com.adminpersonal.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class HabitService {

    private final HabitRepository habitRepository;
    private final HabitCategoryRepository habitCategoryRepository;
    private final UserRepository userRepository;
    private final HabitMapper habitMapper;
    private final HabitCategoryMapper habitCategoryMapper;

    @Transactional(readOnly = true)
    public List<HabitSummaryResponse> findAll(UUID userId) {
        return habitRepository.findAllActiveByUser(userId).stream()
            .map(h -> habitMapper.toSummaryResponse(h, habitCategoryMapper.toResponse(h.getCategory())))
            .toList();
    }

    @Transactional(readOnly = true)
    public HabitResponse findById(UUID userId, UUID habitId) {
        Habit habit = habitRepository.findActiveByIdAndUserId(habitId, userId)
            .orElseThrow(() -> new HabitNotFoundException("Habito no encontrado: " + habitId));
        return habitMapper.toResponse(habit, habitCategoryMapper.toResponse(habit.getCategory()));
    }

    @Transactional(readOnly = true)
    public List<HabitSummaryResponse> findActiveForToday(UUID userId) {
        // DayOfWeek devuelve 1=lunes...7=domingo. Convertir a 0=domingo...6=sabado.
        DayOfWeek dow = LocalDate.now().getDayOfWeek();
        int dayOfWeek = (dow.getValue() == 7) ? 0 : dow.getValue();

        return habitRepository.findActiveForDay(userId, dayOfWeek).stream()
            .map(h -> habitMapper.toSummaryResponse(h, habitCategoryMapper.toResponse(h.getCategory())))
            .toList();
    }

    @Transactional
    public HabitResponse create(UUID userId, CreateHabitRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        validateFrequencyDays(request.frequency(), request.frequencyDays());

        HabitCategory category = resolveCategory(userId, request.categoryId());

        Habit habit = Habit.builder()
            .user(user)
            .category(category)
            .name(request.name())
            .description(request.description())
            .frequency(request.frequency())
            .frequencyDays(request.frequencyDays())
            .color(request.color())
            .icon(request.icon())
            .active(true)
            .currentStreak(0)
            .maxStreak(0)
            .build();

        Habit saved = habitRepository.save(habit);
        return habitMapper.toResponse(saved, habitCategoryMapper.toResponse(saved.getCategory()));
    }

    @Transactional
    public HabitResponse update(UUID userId, UUID habitId, UpdateHabitRequest request) {
        Habit habit = habitRepository.findActiveByIdAndUserId(habitId, userId)
            .orElseThrow(() -> new HabitNotFoundException("Habito no encontrado: " + habitId));

        if (request.name() != null) habit.setName(request.name());
        if (request.description() != null) habit.setDescription(request.description());
        if (request.color() != null) habit.setColor(request.color());
        if (request.icon() != null) habit.setIcon(request.icon());

        if (request.categoryId() != null) {
            HabitCategory newCategory = resolveCategory(userId, request.categoryId());
            habit.setCategory(newCategory);
        }

        // Resolver frecuencia objetivo (si viene en el update se usa, si no la actual).
        HabitFrequency targetFrequency = (request.frequency() != null) ? request.frequency() : habit.getFrequency();
        Integer[] targetDays = (request.frequencyDays() != null) ? request.frequencyDays() : habit.getFrequencyDays();

        // Solo validamos si en este request se modifica frecuencia o dias.
        if (request.frequency() != null || request.frequencyDays() != null) {
            validateFrequencyDays(targetFrequency, targetDays);
        }

        if (request.frequency() != null) habit.setFrequency(targetFrequency);
        if (request.frequencyDays() != null) habit.setFrequencyDays(targetDays);

        Habit saved = habitRepository.save(habit);
        return habitMapper.toResponse(saved, habitCategoryMapper.toResponse(saved.getCategory()));
    }

    @Transactional
    public HabitResponse setActive(UUID userId, UUID habitId, boolean active) {
        Habit habit = habitRepository.findActiveByIdAndUserId(habitId, userId)
            .orElseThrow(() -> new HabitNotFoundException("Habito no encontrado: " + habitId));

        habit.setActive(active);
        Habit saved = habitRepository.save(habit);
        return habitMapper.toResponse(saved, habitCategoryMapper.toResponse(saved.getCategory()));
    }

    @Transactional
    public void softDelete(UUID userId, UUID habitId) {
        Habit habit = habitRepository.findActiveByIdAndUserId(habitId, userId)
            .orElseThrow(() -> new HabitNotFoundException("Habito no encontrado: " + habitId));

        habit.setDeletedAt(LocalDateTime.now());
        habitRepository.save(habit);
    }

    // ---------- helpers ----------

    private void validateFrequencyDays(HabitFrequency frequency, Integer[] frequencyDays) {
        if (frequency == HabitFrequency.CUSTOM) {
            if (frequencyDays == null || frequencyDays.length == 0) {
                throw new IllegalArgumentException("frequencyDays es obligatorio cuando frequency es CUSTOM");
            }
            boolean anyInvalid = Arrays.stream(frequencyDays)
                .anyMatch(d -> d == null || d < 0 || d > 6);
            if (anyInvalid) {
                throw new IllegalArgumentException("frequencyDays solo puede contener valores entre 0 y 6 (0=domingo, 6=sabado)");
            }
        }
    }

    /**
     * Resuelve una categoria que pertenezca al usuario o al sistema.
     * Lanza ResourceNotFoundException si no existe ninguna accesible.
     */
    private HabitCategory resolveCategory(UUID userId, UUID categoryId) {
        return habitCategoryRepository.findByIdAndUserId(categoryId, userId)
            .orElseGet(() -> {
                if (habitCategoryRepository.existsByIdAndUserIsNull(categoryId)) {
                    return habitCategoryRepository.findById(categoryId)
                        .orElseThrow(() -> new ResourceNotFoundException("Categoria de habito no encontrada: " + categoryId));
                }
                throw new ResourceNotFoundException("Categoria de habito no encontrada: " + categoryId);
            });
    }
}
