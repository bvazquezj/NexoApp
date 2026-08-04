package com.adminpersonal.finance.infrastructure.persistence;

import com.adminpersonal.finance.domain.model.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface SubscriptionRepository extends JpaRepository<Subscription, UUID> {

    List<Subscription> findByUserId(UUID userId);

    List<Subscription> findByUserIdAndActive(UUID userId, boolean active);
}
