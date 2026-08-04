package com.adminpersonal.finance.application.service;

import com.adminpersonal.auth.domain.model.User;
import com.adminpersonal.auth.infrastructure.persistence.UserRepository;
import com.adminpersonal.finance.application.dto.request.CreateCategoryRequest;
import com.adminpersonal.finance.application.dto.request.UpdateCategoryRequest;
import com.adminpersonal.finance.application.dto.response.CategoryResponse;
import com.adminpersonal.finance.application.mapper.CategoryMapper;
import com.adminpersonal.finance.domain.enums.CategoryType;
import com.adminpersonal.finance.domain.exception.CategoryNotDeletableException;
import com.adminpersonal.finance.domain.exception.SystemCategoryModificationException;
import com.adminpersonal.finance.domain.model.Category;
import com.adminpersonal.finance.infrastructure.persistence.BudgetRepository;
import com.adminpersonal.finance.infrastructure.persistence.CategoryRepository;
import com.adminpersonal.finance.infrastructure.persistence.TransactionRepository;
import com.adminpersonal.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final TransactionRepository transactionRepository;
    private final BudgetRepository budgetRepository;
    private final UserRepository userRepository;
    private final CategoryMapper categoryMapper;

    @Transactional(readOnly = true)
    public List<CategoryResponse> findAll(UUID userId, CategoryType type) {
        List<Category> categories = (type != null)
            ? categoryRepository.findAllForUserByType(userId, type)
            : categoryRepository.findAllForUser(userId);
        return categories.stream().map(categoryMapper::toResponse).toList();
    }

    @Transactional
    public CategoryResponse create(UUID userId, CreateCategoryRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        Category category = Category.builder()
            .name(request.getName())
            .type(request.getType())
            .color(request.getColor())
            .user(user)
            .build();

        return categoryMapper.toResponse(categoryRepository.save(category));
    }

    @Transactional
    public CategoryResponse update(UUID userId, UUID categoryId, UpdateCategoryRequest request) {
        if (categoryRepository.existsByIdAndUserIsNull(categoryId)) {
            throw new SystemCategoryModificationException("Las categorias del sistema no pueden ser modificadas");
        }

        Category category = categoryRepository.findByIdAndUserId(categoryId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Categoria no encontrada: " + categoryId));

        if (request.getName() != null) category.setName(request.getName());
        if (request.getType() != null) category.setType(request.getType());
        if (request.getColor() != null) category.setColor(request.getColor());

        return categoryMapper.toResponse(categoryRepository.save(category));
    }

    @Transactional
    public void delete(UUID userId, UUID categoryId) {
        if (categoryRepository.existsByIdAndUserIsNull(categoryId)) {
            throw new SystemCategoryModificationException("Las categorias del sistema no pueden ser eliminadas");
        }

        Category category = categoryRepository.findByIdAndUserId(categoryId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Categoria no encontrada: " + categoryId));

        if (transactionRepository.existsByCategoryIdAndUserIdAndDeletedAtIsNull(categoryId, userId)) {
            throw new CategoryNotDeletableException("La categoria tiene transacciones activas y no puede ser eliminada");
        }

        if (budgetRepository.existsByCategoryIdAndUserId(categoryId, userId)) {
            throw new CategoryNotDeletableException("La categoria tiene presupuestos asociados y no puede ser eliminada");
        }

        categoryRepository.delete(category);
    }
}
