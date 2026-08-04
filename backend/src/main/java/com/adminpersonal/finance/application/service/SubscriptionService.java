package com.adminpersonal.finance.application.service;

import com.adminpersonal.auth.domain.model.User;
import com.adminpersonal.auth.infrastructure.persistence.UserRepository;
import com.adminpersonal.finance.application.dto.request.CreateSubscriptionRequest;
import com.adminpersonal.finance.application.dto.request.UpdateSubscriptionRequest;
import com.adminpersonal.finance.application.dto.response.MonthlyCostResponse;
import com.adminpersonal.finance.application.dto.response.MonthlyCostResponse.SubscriptionCostItem;
import com.adminpersonal.finance.application.dto.response.SubscriptionResponse;
import com.adminpersonal.finance.application.mapper.SubscriptionMapper;
import com.adminpersonal.finance.domain.enums.Currency;
import com.adminpersonal.finance.domain.enums.SubscriptionFrequency;
import com.adminpersonal.finance.domain.model.Category;
import com.adminpersonal.finance.domain.model.Subscription;
import com.adminpersonal.finance.infrastructure.persistence.CategoryRepository;
import com.adminpersonal.finance.infrastructure.persistence.SubscriptionRepository;
import com.adminpersonal.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final SubscriptionMapper subscriptionMapper;

    @Transactional(readOnly = true)
    public List<SubscriptionResponse> findAll(UUID userId, Boolean active) {
        List<Subscription> subscriptions = (active != null)
            ? subscriptionRepository.findByUserIdAndActive(userId, active)
            : subscriptionRepository.findByUserId(userId);
        return subscriptions.stream().map(subscriptionMapper::toResponse).toList();
    }

    @Transactional
    public SubscriptionResponse create(UUID userId, CreateSubscriptionRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        Category category = categoryRepository.findById(request.getCategoryId())
            .orElseThrow(() -> new ResourceNotFoundException("Categoria no encontrada: " + request.getCategoryId()));

        validateCategoryAccess(category, userId);

        Subscription subscription = Subscription.builder()
            .name(request.getName())
            .amount(request.getAmount())
            .currency(request.getCurrency())
            .frequency(request.getFrequency())
            .nextBillingDate(request.getNextBillingDate())
            .category(category)
            .active(true)
            .user(user)
            .build();

        return subscriptionMapper.toResponse(subscriptionRepository.save(subscription));
    }

    @Transactional
    public SubscriptionResponse update(UUID userId, UUID subscriptionId, UpdateSubscriptionRequest request) {
        Subscription subscription = findOwnedSubscription(userId, subscriptionId);

        if (request.getName() != null) subscription.setName(request.getName());
        if (request.getAmount() != null) subscription.setAmount(request.getAmount());
        if (request.getCurrency() != null) subscription.setCurrency(request.getCurrency());
        if (request.getFrequency() != null) subscription.setFrequency(request.getFrequency());
        if (request.getNextBillingDate() != null) subscription.setNextBillingDate(request.getNextBillingDate());

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Categoria no encontrada: " + request.getCategoryId()));
            validateCategoryAccess(category, userId);
            subscription.setCategory(category);
        }

        return subscriptionMapper.toResponse(subscriptionRepository.save(subscription));
    }

    @Transactional
    public void delete(UUID userId, UUID subscriptionId) {
        Subscription subscription = findOwnedSubscription(userId, subscriptionId);
        subscriptionRepository.delete(subscription);
    }

    @Transactional
    public SubscriptionResponse toggle(UUID userId, UUID subscriptionId) {
        Subscription subscription = findOwnedSubscription(userId, subscriptionId);
        subscription.setActive(!subscription.isActive());
        return subscriptionMapper.toResponse(subscriptionRepository.save(subscription));
    }

    @Transactional(readOnly = true)
    public MonthlyCostResponse calculateMonthlyCost(UUID userId, Currency targetCurrency, BigDecimal exchangeRate) {
        List<Subscription> active = subscriptionRepository.findByUserIdAndActive(userId, true);

        BigDecimal effectiveRate = (exchangeRate != null) ? exchangeRate : BigDecimal.ONE;

        List<SubscriptionCostItem> breakdown = active.stream().map(sub -> {
            BigDecimal monthlyCost = toMonthlyCost(sub.getAmount(), sub.getFrequency());
            monthlyCost = convertCurrency(monthlyCost, sub.getCurrency(), targetCurrency, effectiveRate);

            return new SubscriptionCostItem(
                sub.getId(),
                sub.getName(),
                monthlyCost,
                sub.getAmount(),
                sub.getCurrency().name(),
                sub.getFrequency().name()
            );
        }).toList();

        BigDecimal total = breakdown.stream()
            .map(SubscriptionCostItem::monthlyCost)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        return MonthlyCostResponse.builder()
            .currency(targetCurrency.name())
            .totalMonthlyCost(total)
            .breakdown(breakdown)
            .build();
    }

    private Subscription findOwnedSubscription(UUID userId, UUID subscriptionId) {
        Subscription subscription = subscriptionRepository.findById(subscriptionId)
            .orElseThrow(() -> new ResourceNotFoundException("Suscripcion no encontrada: " + subscriptionId));
        if (!subscription.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("No tienes permiso para modificar esta suscripcion");
        }
        return subscription;
    }

    private void validateCategoryAccess(Category category, UUID userId) {
        boolean isSystemCategory = category.getUser() == null;
        boolean isUserCategory = !isSystemCategory && category.getUser().getId().equals(userId);
        if (!isSystemCategory && !isUserCategory) {
            throw new AccessDeniedException("No tienes permiso para usar esta categoria");
        }
    }

    private BigDecimal toMonthlyCost(BigDecimal amount, SubscriptionFrequency frequency) {
        return switch (frequency) {
            case MONTHLY -> amount;
            case YEARLY -> amount.divide(BigDecimal.valueOf(12), 4, RoundingMode.HALF_UP);
            case WEEKLY -> amount.multiply(BigDecimal.valueOf(52))
                .divide(BigDecimal.valueOf(12), 4, RoundingMode.HALF_UP);
        };
    }

    private BigDecimal convertCurrency(BigDecimal amount, Currency from, Currency to, BigDecimal exchangeRate) {
        if (from == to) return amount;
        if (from == Currency.MXN && to == Currency.USD) {
            return amount.divide(exchangeRate, 4, RoundingMode.HALF_UP);
        }
        if (from == Currency.USD && to == Currency.MXN) {
            return amount.multiply(exchangeRate).setScale(4, RoundingMode.HALF_UP);
        }
        return amount;
    }
}
