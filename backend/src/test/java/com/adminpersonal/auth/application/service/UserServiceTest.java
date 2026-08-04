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
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private RefreshTokenRepository refreshTokenRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private UserMapper userMapper;

    @InjectMocks
    private UserService userService;

    // --- getProfile ---

    @Test
    void getProfile_shouldReturnMappedResponse() {
        UUID userId = UUID.randomUUID();
        User user = buildUser(userId);
        UserProfileResponse expected = buildProfileResponse(userId, user);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(userMapper.toProfileResponse(user)).thenReturn(expected);

        UserProfileResponse result = userService.getProfile(userId);

        assertThat(result).isEqualTo(expected);
    }

    @Test
    void getProfile_shouldThrowWhenUserNotFound() {
        UUID userId = UUID.randomUUID();
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.getProfile(userId))
            .isInstanceOf(ResourceNotFoundException.class);
    }

    // --- updateProfile ---

    @Test
    void updateProfile_shouldUpdateNameAndReturnResponse() {
        UUID userId = UUID.randomUUID();
        User user = buildUser(userId);
        UpdateProfileRequest request = new UpdateProfileRequest("Nuevo Nombre");
        UserProfileResponse expected = buildProfileResponse(userId, user);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(userRepository.save(user)).thenReturn(user);
        when(userMapper.toProfileResponse(user)).thenReturn(expected);

        UserProfileResponse result = userService.updateProfile(userId, request);

        assertThat(user.getName()).isEqualTo("Nuevo Nombre");
        assertThat(result).isEqualTo(expected);
        verify(userRepository).save(user);
    }

    @Test
    void updateProfile_shouldThrowWhenUserNotFound() {
        UUID userId = UUID.randomUUID();
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.updateProfile(userId, new UpdateProfileRequest("Name")))
            .isInstanceOf(ResourceNotFoundException.class);
    }

    // --- changePassword ---

    @Test
    void changePassword_shouldEncodeNewPasswordAndRevokeTokens() {
        UUID userId = UUID.randomUUID();
        User user = buildUser(userId);
        ChangePasswordRequest request = new ChangePasswordRequest("OldPass1", "NewPass1");

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("OldPass1", user.getPasswordHash())).thenReturn(true);
        when(passwordEncoder.encode("NewPass1")).thenReturn("$2a$new");
        when(userRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        userService.changePassword(userId, request);

        assertThat(user.getPasswordHash()).isEqualTo("$2a$new");
        verify(refreshTokenRepository).revokeAllByUserId(eq(userId), any());
    }

    @Test
    void changePassword_shouldThrowWhenCurrentPasswordWrong() {
        UUID userId = UUID.randomUUID();
        User user = buildUser(userId);
        ChangePasswordRequest request = new ChangePasswordRequest("WrongOld", "NewPass1");

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("WrongOld", user.getPasswordHash())).thenReturn(false);

        assertThatThrownBy(() -> userService.changePassword(userId, request))
            .isInstanceOf(InvalidCredentialsException.class);

        verify(userRepository, never()).save(any());
        verifyNoInteractions(refreshTokenRepository);
    }

    @Test
    void changePassword_shouldThrowWhenUserNotFound() {
        UUID userId = UUID.randomUUID();
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.changePassword(userId,
            new ChangePasswordRequest("OldPass1", "NewPass1")))
            .isInstanceOf(ResourceNotFoundException.class);
    }

    // --- helpers ---

    private User buildUser(UUID id) {
        return User.builder()
            .id(id)
            .name("Test User")
            .email("test@example.com")
            .passwordHash("$2a$12$oldHash")
            .emailVerified(true)
            .createdAt(LocalDateTime.now())
            .updatedAt(LocalDateTime.now())
            .build();
    }

    private UserProfileResponse buildProfileResponse(UUID id, User user) {
        return new UserProfileResponse(
            id, user.getName(), user.getEmail(),
            user.isEmailVerified(), user.getCreatedAt(), user.getUpdatedAt()
        );
    }
}
