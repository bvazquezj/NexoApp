package com.adminpersonal.habit.application.service;

import com.adminpersonal.auth.domain.model.User;
import com.adminpersonal.auth.infrastructure.persistence.UserRepository;
import com.adminpersonal.habit.application.dto.request.CreateHabitCategoryRequest;
import com.adminpersonal.habit.application.dto.request.UpdateHabitCategoryRequest;
import com.adminpersonal.habit.application.dto.response.HabitCategoryResponse;
import com.adminpersonal.habit.application.mapper.HabitCategoryMapper;
import com.adminpersonal.habit.domain.exception.HabitCategoryInUseException;
import com.adminpersonal.habit.domain.model.HabitCategory;
import com.adminpersonal.habit.infrastructure.persistence.HabitCategoryRepository;
import com.adminpersonal.habit.infrastructure.persistence.HabitRepository;
import com.adminpersonal.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class HabitCategoryService {

    private final HabitCategoryRepository habitCategoryRepository;
    private final HabitRepository habitRepository;
    private final UserRepository userRepository;
    private final HabitCategoryMapper habitCategoryMapper;

    @Transactional(readOnly = true)
    public List<HabitCategoryResponse> findAll(UUID userId) {
        return habitCategoryRepository.findAllForUser(userId).stream()
            .map(habitCategoryMapper::toResponse)
            .toList();
    }

    @Transactional
    public HabitCategoryResponse create(UUID userId, CreateHabitCategoryRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        HabitCategory category = HabitCategory.builder()
            .name(request.name())
            .color(request.color())
            .system(false)
            .user(user)
            .build();

        return habitCategoryMapper.toResponse(habitCategoryRepository.save(category));
    }

    @Transactional
    public HabitCategoryResponse update(UUID userId, UUID categoryId, UpdateHabitCategoryRequest request) {
        if (habitCategoryRepository.existsByIdAndUserIsNull(categoryId)) {
            throw new AccessDeniedException("Las categorias del sistema no pueden ser modificadas");
        }

        HabitCategory category = habitCategoryRepository.findByIdAndUserId(categoryId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Categoria de habito no encontrada: " + categoryId));

        if (request.name() != null) category.setName(request.name());
        if (request.color() != null) category.setColor(request.color());

        return habitCategoryMapper.toResponse(habitCategoryRepository.save(category));
    }

    @Transactional
    public void delete(UUID userId, UUID categoryId) {
        if (habitCategoryRepository.existsByIdAndUserIsNull(categoryId)) {
            throw new AccessDeniedException("Las categorias del sistema no pueden ser eliminadas");
        }

        HabitCategory category = habitCategoryRepository.findByIdAndUserId(categoryId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Categoria de habito no encontrada: " + categoryId));

        if (habitRepository.existsByCategoryIdAndDeletedAtIsNull(categoryId)) {
            throw new HabitCategoryInUseException("La categoria tiene habitos activos y no puede ser eliminada");
        }

        habitCategoryRepository.delete(category);
    }
}
