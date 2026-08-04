package com.adminpersonal.auth.application.service;

import com.adminpersonal.auth.application.dto.request.ChangePasswordRequest;
import com.adminpersonal.auth.application.dto.request.UpdateProfileRequest;
import com.adminpersonal.auth.application.dto.response.UserProfileResponse;
import com.adminpersonal.auth.application.mapper.UserMapper;
import com.adminpersonal.auth.domain.exception.InvalidCredentialsException;
import com.adminpersonal.auth.domain.model.User;
import com.adminpersonal.auth.infrastructure.persistence.RefreshTokenRepository;
import com.adminpersonal.auth.infrastructure.persistence.UserRepository;
import com.adminpersonal.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;

    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(UUID userId) {
        User user = findUserById(userId);
        return userMapper.toProfileResponse(user);
    }

    @Transactional
    public UserProfileResponse updateProfile(UUID userId, UpdateProfileRequest request) {
        User user = findUserById(userId);
        user.setName(request.name());
        userRepository.save(user);
        return userMapper.toProfileResponse(user);
    }

    @Transactional
    public void changePassword(UUID userId, ChangePasswordRequest request) {
        User user = findUserById(userId);

        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new InvalidCredentialsException("La contraseña actual es incorrecta");
        }

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);

        // Revoke all active sessions so other devices must log in again
        refreshTokenRepository.revokeAllByUserId(userId, LocalDateTime.now());
    }

    // --- Private helpers ---

    private User findUserById(UUID userId) {
        return userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado: " + userId));
    }
}
