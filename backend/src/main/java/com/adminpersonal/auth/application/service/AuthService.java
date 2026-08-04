package com.adminpersonal.auth.application.service;

import com.adminpersonal.auth.application.dto.request.LoginRequest;
import com.adminpersonal.auth.application.dto.request.RegisterRequest;
import com.adminpersonal.auth.application.dto.response.AuthResponse;
import com.adminpersonal.auth.application.dto.response.UserProfileResponse;
import com.adminpersonal.auth.application.mapper.UserMapper;
import com.adminpersonal.auth.domain.exception.*;
import com.adminpersonal.auth.domain.model.RefreshToken;
import com.adminpersonal.auth.domain.model.User;
import com.adminpersonal.auth.infrastructure.persistence.RefreshTokenRepository;
import com.adminpersonal.auth.infrastructure.persistence.UserRepository;
import com.adminpersonal.shared.email.ResendEmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtService jwtService;
    private final ResendEmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;

    @Value("${app.jwt.access-token-expiration-seconds}")
    private int accessTokenExpirationSeconds;

    @Value("${app.jwt.refresh-token-expiration-days}")
    private int refreshTokenExpirationDays;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new EmailAlreadyExistsException("El email ya está registrado: " + request.email());
        }

        String rawVerificationToken = jwtService.generateRefreshToken();
        String tokenHash = jwtService.hashToken(rawVerificationToken);

        User user = User.builder()
            .email(request.email())
            .name(request.name())
            .passwordHash(passwordEncoder.encode(request.password()))
            .emailVerified(false)
            .emailVerificationToken(tokenHash)
            .emailVerificationExpiresAt(LocalDateTime.now().plusHours(24))
            .build();

        userRepository.save(user);

        emailService.sendVerificationEmail(user.getEmail(), user.getName(), rawVerificationToken);

        return new AuthResponse(null, null, null, null, true,
            "Cuenta creada. Revisa tu email para verificar tu cuenta.");
    }

    @Transactional
    public AuthResponse verifyEmail(String rawToken) {
        String tokenHash = jwtService.hashToken(rawToken);

        User user = userRepository.findByEmailVerificationToken(tokenHash)
            .orElseThrow(() -> new InvalidVerificationTokenException("Token de verificación inválido o expirado"));

        if (user.getEmailVerificationExpiresAt() == null
                || user.getEmailVerificationExpiresAt().isBefore(LocalDateTime.now())) {
            throw new InvalidVerificationTokenException("El token de verificación ha expirado");
        }

        user.setEmailVerified(true);
        user.setEmailVerificationToken(null);
        user.setEmailVerificationExpiresAt(null);
        userRepository.save(user);

        return buildAuthResponse(user, null, null);
    }

    @Transactional
    public AuthResponse login(LoginRequest request, String userAgent, String ip) {
        User user = userRepository.findByEmail(request.email())
            .orElseThrow(() -> new InvalidCredentialsException("Credenciales incorrectas"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new InvalidCredentialsException("Credenciales incorrectas");
        }

        if (!user.isEmailVerified()) {
            throw new EmailNotVerifiedException("Debes verificar tu email antes de iniciar sesión");
        }

        return buildAuthResponse(user, userAgent, ip);
    }

    @Transactional
    public AuthResponse refresh(String rawToken) {
        String tokenHash = jwtService.hashToken(rawToken);

        RefreshToken refreshToken = refreshTokenRepository
            .findByTokenHashAndExpiresAtAfterAndRevokedAtIsNull(tokenHash, LocalDateTime.now())
            .orElseThrow(() -> new InvalidRefreshTokenException("Refresh token inválido o expirado"));

        User user = refreshToken.getUser();
        String accessToken = jwtService.generateAccessToken(user.getId(), user.getEmail(), user.getName(), user.getRole().name());

        return new AuthResponse(
            accessToken,
            rawToken,
            accessTokenExpirationSeconds,
            userMapper.toProfileResponse(user),
            false,
            null
        );
    }

    @Transactional
    public void logout(String rawRefreshToken) {
        String tokenHash = jwtService.hashToken(rawRefreshToken);

        refreshTokenRepository
            .findByTokenHashAndExpiresAtAfterAndRevokedAtIsNull(tokenHash, LocalDateTime.now())
            .ifPresent(token -> {
                token.setRevokedAt(LocalDateTime.now());
                refreshTokenRepository.save(token);
            });
        // Idempotent — no error if token doesn't exist or is already revoked
    }

    @Transactional
    public void logoutAll(UUID userId) {
        refreshTokenRepository.revokeAllByUserId(userId, LocalDateTime.now());
    }

    @Transactional
    public void resendVerificationEmail(String email) {
        userRepository.findByEmail(email).ifPresent(user -> {
            if (user.isEmailVerified()) {
                return; // Already verified, nothing to do
            }

            // Anti-spam: do not resend if a token was issued less than 1 hour ago
            if (user.getEmailVerificationExpiresAt() != null
                    && user.getEmailVerificationExpiresAt().isAfter(LocalDateTime.now().plusHours(23))) {
                // Token expires in more than 23h means it was issued less than 1h ago
                return;
            }

            String rawToken = jwtService.generateRefreshToken();
            String tokenHash = jwtService.hashToken(rawToken);

            user.setEmailVerificationToken(tokenHash);
            user.setEmailVerificationExpiresAt(LocalDateTime.now().plusHours(24));
            userRepository.save(user);

            emailService.sendVerificationEmail(user.getEmail(), user.getName(), rawToken);
        });
        // Always returns 200 — does not reveal whether email exists
    }

    @Transactional
    public void forgotPassword(String email) {
        userRepository.findByEmail(email).ifPresent(user -> {
            String rawToken = jwtService.generateRefreshToken();
            String tokenHash = jwtService.hashToken(rawToken);

            user.setPasswordResetToken(tokenHash);
            user.setPasswordResetExpiresAt(LocalDateTime.now().plusHours(1));
            userRepository.save(user);

            emailService.sendPasswordResetEmail(user.getEmail(), user.getName(), rawToken);
        });
        // Always returns 200 — does not reveal whether email exists
    }

    @Transactional
    public void resetPassword(String rawToken, String newPassword) {
        String tokenHash = jwtService.hashToken(rawToken);

        User user = userRepository.findByPasswordResetToken(tokenHash)
            .orElseThrow(() -> new InvalidResetTokenException("Token de restablecimiento inválido o ya usado"));

        if (user.getPasswordResetExpiresAt() == null
                || user.getPasswordResetExpiresAt().isBefore(LocalDateTime.now())) {
            throw new InvalidResetTokenException("El token de restablecimiento ha expirado");
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setPasswordResetToken(null);
        user.setPasswordResetExpiresAt(null);
        userRepository.save(user);

        // Revoke all active sessions after password reset
        refreshTokenRepository.revokeAllByUserId(user.getId(), LocalDateTime.now());
    }

    // --- Private helpers ---

    private AuthResponse buildAuthResponse(User user, String userAgent, String ip) {
        String accessToken = jwtService.generateAccessToken(user.getId(), user.getEmail(), user.getName(), user.getRole().name());
        String rawRefreshToken = jwtService.generateRefreshToken();
        String refreshTokenHash = jwtService.hashToken(rawRefreshToken);

        RefreshToken refreshToken = RefreshToken.builder()
            .user(user)
            .tokenHash(refreshTokenHash)
            .expiresAt(LocalDateTime.now().plusDays(refreshTokenExpirationDays))
            .userAgent(userAgent)
            .ipAddress(ip)
            .build();

        refreshTokenRepository.save(refreshToken);

        UserProfileResponse profile = userMapper.toProfileResponse(user);

        return new AuthResponse(
            accessToken,
            rawRefreshToken,
            accessTokenExpirationSeconds,
            profile,
            false,
            null
        );
    }
}
