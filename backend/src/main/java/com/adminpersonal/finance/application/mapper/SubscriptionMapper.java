package com.adminpersonal.finance.application.mapper;

import com.adminpersonal.finance.application.dto.response.SubscriptionResponse;
import com.adminpersonal.finance.domain.model.Subscription;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SubscriptionMapper {

    private final CategoryMapper categoryMapper;

    public SubscriptionResponse toResponse(Subscription subscription) {
        if (subscription == null) return null;
        return SubscriptionResponse.builder()
            .id(subscription.getId())
            .name(subscription.getName())
            .amount(subscription.getAmount())
            .currency(subscription.getCurrency().name())
            .frequency(subscription.getFrequency().name())
            .nextBillingDate(subscription.getNextBillingDate())
            .active(subscription.isActive())
            .category(categoryMapper.toResponse(subscription.getCategory()))
            .build();
    }
}
