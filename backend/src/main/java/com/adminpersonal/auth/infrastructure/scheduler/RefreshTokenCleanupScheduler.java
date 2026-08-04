package com.adminpersonal.auth.infrastructure.scheduler;

import com.adminpersonal.auth.infrastructure.persistence.RefreshTokenRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class RefreshTokenCleanupScheduler {

    private final RefreshTokenRepository refreshTokenRepository;

    @Scheduled(cron = "0 0 4 * * 0") // Sundays at 4 AM
    @Transactional
    public void cleanupExpiredTokens() {
        refreshTokenRepository.deleteExpired(LocalDateTime.now());
    }
}
