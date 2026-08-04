package com.adminpersonal.finance.application.service;

import com.adminpersonal.auth.domain.model.User;
import com.adminpersonal.auth.infrastructure.persistence.UserRepository;
import com.adminpersonal.finance.application.dto.request.CreateTransactionRequest;
import com.adminpersonal.finance.application.dto.request.UpdateTransactionRequest;
import com.adminpersonal.finance.application.dto.response.TransactionPageResponse;
import com.adminpersonal.finance.application.dto.response.TransactionResponse;
import com.adminpersonal.finance.application.mapper.TransactionMapper;
import com.adminpersonal.finance.domain.enums.CategoryType;
import com.adminpersonal.finance.domain.enums.TransactionType;
import com.adminpersonal.finance.domain.exception.FutureDateException;
import com.adminpersonal.finance.domain.model.Category;
import com.adminpersonal.finance.domain.model.Transaction;
import com.adminpersonal.finance.infrastructure.persistence.CategoryRepository;
import com.adminpersonal.finance.infrastructure.persistence.TransactionRepository;
import com.adminpersonal.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final TransactionMapper transactionMapper;

    @Transactional(readOnly = true)
    public TransactionPageResponse list(UUID userId, int page, int size,
                                        LocalDate from, LocalDate to,
                                        UUID categoryId, TransactionType type) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "date"));
        Page<Transaction> result = transactionRepository.findAllActive(userId, from, to, categoryId, type, pageable);

        List<TransactionResponse> content = result.getContent().stream()
            .map(transactionMapper::toResponse)
            .toList();

        return TransactionPageResponse.builder()
            .content(content)
            .page(result.getNumber())
            .size(result.getSize())
            .totalElements(result.getTotalElements())
            .totalPages(result.getTotalPages())
            .build();
    }

    @Transactional
    public TransactionResponse create(UUID userId, CreateTransactionRequest request) {
        if (request.getDate().isAfter(LocalDate.now())) {
            throw new FutureDateException("La fecha de la transaccion no puede ser futura");
        }

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        Category category = categoryRepository.findById(request.getCategoryId())
            .orElseThrow(() -> new ResourceNotFoundException("Categoria no encontrada: " + request.getCategoryId()));

        validateCategoryAccess(category, userId);
        validateCategoryTypeCompatibility(request.getType(), category.getType());

        Transaction transaction = Transaction.builder()
            .type(request.getType())
            .amount(request.getAmount())
            .currency(request.getCurrency())
            .exchangeRate(request.getExchangeRate())
            .description(request.getDescription())
            .date(request.getDate())
            .category(category)
            .user(user)
            .clientId(request.getClientId())
            .build();

        return transactionMapper.toResponse(transactionRepository.save(transaction));
    }

    @Transactional(readOnly = true)
    public TransactionResponse findById(UUID userId, UUID transactionId) {
        Transaction transaction = transactionRepository.findByIdAndUserId(transactionId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Transaccion no encontrada: " + transactionId));

        if (transaction.getDeletedAt() != null) {
            throw new ResourceNotFoundException("Transaccion no encontrada: " + transactionId);
        }

        return transactionMapper.toResponse(transaction);
    }

    @Transactional
    public TransactionResponse update(UUID userId, UUID transactionId, UpdateTransactionRequest request) {
        Transaction transaction = transactionRepository.findByIdAndUserId(transactionId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Transaccion no encontrada: " + transactionId));

        if (transaction.getDeletedAt() != null) {
            throw new ResourceNotFoundException("Transaccion no encontrada: " + transactionId);
        }

        if (request.getDate() != null && request.getDate().isAfter(LocalDate.now())) {
            throw new FutureDateException("La fecha de la transaccion no puede ser futura");
        }

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Categoria no encontrada: " + request.getCategoryId()));
            validateCategoryAccess(category, userId);
            transaction.setCategory(category);
        }

        if (request.getType() != null) transaction.setType(request.getType());

        // Always re-validate after applying type and/or category changes.
        validateCategoryTypeCompatibility(transaction.getType(), transaction.getCategory().getType());
        if (request.getDate() != null) transaction.setDate(request.getDate());
        if (request.getDescription() != null) transaction.setDescription(request.getDescription());
        if (request.getClientId() != null) transaction.setClientId(request.getClientId());

        boolean amountChanged = request.getAmount() != null;
        boolean currencyChanged = request.getCurrency() != null;

        if (amountChanged) transaction.setAmount(request.getAmount());
        if (currencyChanged) transaction.setCurrency(request.getCurrency());

        if (amountChanged || currencyChanged) {
            if (request.getExchangeRate() != null) {
                transaction.setExchangeRate(request.getExchangeRate());
            }
        }

        return transactionMapper.toResponse(transactionRepository.save(transaction));
    }

    @Transactional
    public void softDelete(UUID userId, UUID transactionId) {
        Transaction transaction = transactionRepository.findByIdAndUserId(transactionId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Transaccion no encontrada: " + transactionId));

        transaction.setDeletedAt(LocalDateTime.now());
        transactionRepository.save(transaction);
    }

    @Transactional(readOnly = true)
    public List<TransactionResponse> listTrash(UUID userId) {
        return transactionRepository.findByUserIdAndDeletedAtIsNotNull(userId).stream()
            .map(transactionMapper::toResponse)
            .toList();
    }

    @Transactional
    public TransactionResponse restore(UUID userId, UUID transactionId) {
        Transaction transaction = transactionRepository.findByIdAndUserId(transactionId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Transaccion no encontrada: " + transactionId));

        transaction.setDeletedAt(null);
        return transactionMapper.toResponse(transactionRepository.save(transaction));
    }

    private void validateCategoryAccess(Category category, UUID userId) {
        boolean isSystemCategory = category.getUser() == null;
        boolean isUserCategory = !isSystemCategory && category.getUser().getId().equals(userId);
        if (!isSystemCategory && !isUserCategory) {
            throw new AccessDeniedException("No tienes permiso para usar esta categoria");
        }
    }

    private void validateCategoryTypeCompatibility(TransactionType transactionType, CategoryType categoryType) {
        if (transactionType == TransactionType.INCOME
            && categoryType != CategoryType.INCOME && categoryType != CategoryType.BOTH) {
            throw new IllegalArgumentException(
                "La categoria seleccionada no es compatible con transacciones de tipo INCOME");
        }
        if (transactionType == TransactionType.EXPENSE
            && categoryType != CategoryType.EXPENSE && categoryType != CategoryType.BOTH) {
            throw new IllegalArgumentException(
                "La categoria seleccionada no es compatible con transacciones de tipo EXPENSE");
        }
    }
}
