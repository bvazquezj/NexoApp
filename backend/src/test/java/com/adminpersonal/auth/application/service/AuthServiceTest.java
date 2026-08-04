package com.adminpersonal.auth.application.service;

import com.adminpersonal.auth.application.dto.request.LoginRequest;
import com.adminpersonal.auth.application.dto.request.RegisterRequest;
import com.adminpersonal.auth.application.dto.response.AuthResponse;
import com.adminpersonal.auth.application.mapper.UserMapper;
import com.adminpersonal.auth.domain.exception.*;
import com.adminpersonal.auth.domain.model.RefreshToken;
import com.adminpersonal.auth.domain.model.User;
import com.adminpersonal.auth.infrastructure.persistence.RefreshTokenRepository;
import com.adminpersonal.auth.infrastructure.persistence.UserRepository;
import com.adminpersonal.shared.email.ResendEmailService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private RefreshTokenRepository refreshTokenRepository;
    @Mock private JwtService jwtService;
    @Mock private ResendEmailService emailService;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private UserMapper userMapper;

    @InjectMocks
    private AuthService authService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(authService, "accessTokenExpirationSeconds", 900);
        ReflectionTestUtils.setField(authService, "refreshTokenExpirationDays", 7);
    }

    // --- register ---

    @Test
    void register_shouldCreateUserAndReturnRequiresVerification() {
        RegisterRequest request = new RegisterRequest("Ana García", "ana@example.com", "Password1");

        when(userRepository.existsByEmail("ana@example.com")).thenReturn(false);
        when(jwtService.generateRefreshToken()).thenReturn("rawToken");
        when(jwtService.hashToken("rawToken")).thenReturn("hashedToken");
        when(passwordEncoder.encode("Password1")).thenReturn("$2a$hash");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        AuthResponse response = authService.register(request);

        assertThat(response.requiresVerification()).isTrue();
        assertThat(response.accessToken()).isNull();
        assertThat(response.message()).isNotBlank();

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        User saved = userCaptor.getValue();
        assertThat(saved.getEmail()).isEqualTo("ana@example.com");
        assertThat(saved.getPasswordHash()).isEqualTo("$2a$hash");
        assertThat(saved.getEmailVerificationToken()).isEqualTo("hashedToken");
        assertThat(saved.isEmailVerified()).isFalse();

        verify(emailService).sendVerificationEmail(eq("ana@example.com"), eq("Ana García"), eq("rawToken"));
    }

    @Test
    void register_shouldThrowWhenEmailAlreadyExists() {
        when(userRepository.existsByEmail("dup@example.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(
            new RegisterRequest("Name", "dup@example.com", "Password1")))
            .isInstanceOf(EmailAlreadyExistsException.class);

        verify(userRepository, never()).save(any());
        verifyNoInteractions(emailService);
    }

    // --- verifyEmail ---

    @Test
    void verifyEmail_shouldMarkUserVerifiedAndReturnTokens() {
        String rawToken = "rawVerifyToken";
        String hash = "hashVerifyToken";
        User user = buildVerifiedUser(false);
        user.setEmailVerificationToken(hash);
        user.setEmailVerificationExpiresAt(LocalDateTime.now().plusHours(1));

        when(jwtService.hashToken(rawToken)).thenReturn(hash);
        when(userRepository.findByEmailVerificationToken(hash)).thenReturn(Optional.of(user));
        when(jwtService.generateAccessToken(any(), any(), any(), any())).thenReturn("access");
        when(jwtService.generateRefreshToken()).thenReturn("refresh");
        when(jwtService.hashToken("refresh")).thenReturn("refreshHash");
        when(refreshTokenRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(userMapper.toProfileResponse(any())).thenReturn(null);
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        AuthResponse response = authService.verifyEmail(rawToken);

        assertThat(response.accessToken()).isEqualTo("access");
        assertThat(user.isEmailVerified()).isTrue();
        assertThat(user.getEmailVerificationToken()).isNull();
    }

    @Test
    void verifyEmail_shouldThrowWhenTokenNotFound() {
        when(jwtService.hashToken(any())).thenReturn("badHash");
        when(userRepository.findByEmailVerificationToken("badHash")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.verifyEmail("badToken"))
            .isInstanceOf(InvalidVerificationTokenException.class);
    }

    @Test
    void verifyEmail_shouldThrowWhenTokenExpired() {
        String rawToken = "expiredToken";
        String hash = "expiredHash";
        User user = buildVerifiedUser(false);
        user.setEmailVerificationToken(hash);
        user.setEmailVerificationExpiresAt(LocalDateTime.now().minusMinutes(1));

        when(jwtService.hashToken(rawToken)).thenReturn(hash);
        when(userRepository.findByEmailVerificationToken(hash)).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> authService.verifyEmail(rawToken))
            .isInstanceOf(InvalidVerificationTokenException.class);
    }

    // --- login ---

    @Test
    void login_shouldReturnTokensForVerifiedUser() {
        User user = buildVerifiedUser(true);
        LoginRequest request = new LoginRequest("user@example.com", "Password1");

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("Password1", user.getPasswordHash())).thenReturn(true);
        when(jwtService.generateAccessToken(any(), any(), any(), any())).thenReturn("access");
        when(jwtService.generateRefreshToken()).thenReturn("refresh");
        when(jwtService.hashToken("refresh")).thenReturn("refreshHash");
        when(refreshTokenRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(userMapper.toProfileResponse(any())).thenReturn(null);

        AuthResponse response = authService.login(request, "Chrome/120", "127.0.0.1");

        assertThat(response.accessToken()).isEqualTo("access");
        assertThat(response.refreshToken()).isEqualTo("refresh");
        assertThat(response.expiresIn()).isEqualTo(900);
    }

    @Test
    void login_shouldThrowInvalidCredentialsWhenUserNotFound() {
        when(userRepository.findByEmail(any())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(
            new LoginRequest("noone@example.com", "Password1"), null, null))
            .isInstanceOf(InvalidCredentialsException.class);
    }

    @Test
    void login_shouldThrowInvalidCredentialsWhenPasswordWrong() {
        User user = buildVerifiedUser(true);
        when(userRepository.findByEmail(any())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(any(), any())).thenReturn(false);

        assertThatThrownBy(() -> authService.login(
            new LoginRequest("user@example.com", "WrongPass"), null, null))
            .isInstanceOf(InvalidCredentialsException.class);
    }

    @Test
    void login_shouldThrowEmailNotVerifiedWhenUserUnverified() {
        User user = buildVerifiedUser(false);
        when(userRepository.findByEmail(any())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(any(), any())).thenReturn(true);

        assertThatThrownBy(() -> authService.login(
            new LoginRequest("user@example.com", "Password1"), null, null))
            .isInstanceOf(EmailNotVerifiedException.class);
    }

    // --- refresh ---

    @Test
    void refresh_shouldReturnNewAccessToken() {
        User user = buildVerifiedUser(true);
        RefreshToken token = RefreshToken.builder()
            .user(user)
            .tokenHash("hash")
            .expiresAt(LocalDateTime.now().plusDays(7))
            .build();

        when(jwtService.hashToken("rawRefresh")).thenReturn("hash");
        when(refreshTokenRepository.findByTokenHashAndExpiresAtAfterAndRevokedAtIsNull(eq("hash"), any()))
            .thenReturn(Optional.of(token));
        when(jwtService.generateAccessToken(any(), any(), any(), any())).thenReturn("newAccess");
        when(userMapper.toProfileResponse(any())).thenReturn(null);

        AuthResponse response = authService.refresh("rawRefresh");

        assertThat(response.accessToken()).isEqualTo("newAccess");
        assertThat(response.refreshToken()).isEqualTo("rawRefresh");
    }

    @Test
    void refresh_shouldThrowWhenTokenInvalid() {
        when(jwtService.hashToken(any())).thenReturn("badHash");
        when(refreshTokenRepository.findByTokenHashAndExpiresAtAfterAndRevokedAtIsNull(any(), any()))
            .thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.refresh("badToken"))
            .isInstanceOf(InvalidRefreshTokenException.class);
    }

    // --- logout ---

    @Test
    void logout_shouldRevokeToken() {
        RefreshToken token = RefreshToken.builder()
            .tokenHash("hash")
            .expiresAt(LocalDateTime.now().plusDays(1))
            .build();

        when(jwtService.hashToken("rawToken")).thenReturn("hash");
        when(refreshTokenRepository.findByTokenHashAndExpiresAtAfterAndRevokedAtIsNull(eq("hash"), any()))
            .thenReturn(Optional.of(token));
        when(refreshTokenRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        authService.logout("rawToken");

        assertThat(token.getRevokedAt()).isNotNull();
        verify(refreshTokenRepository).save(token);
    }

    @Test
    void logout_shouldBeIdempotentWhenTokenNotFound() {
        when(jwtService.hashToken(any())).thenReturn("gone");
        when(refreshTokenRepository.findByTokenHashAndExpiresAtAfterAndRevokedAtIsNull(any(), any()))
            .thenReturn(Optional.empty());

        assertThatNoException().isThrownBy(() -> authService.logout("gone"));
        verify(refreshTokenRepository, never()).save(any());
    }

    // --- forgotPassword ---

    @Test
    void forgotPassword_shouldSendEmailWhenUserExists() {
        User user = buildVerifiedUser(true);
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(jwtService.generateRefreshToken()).thenReturn("resetRaw");
        when(jwtService.hashToken("resetRaw")).thenReturn("resetHash");
        when(userRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        authService.forgotPassword("user@example.com");

        verify(emailService).sendPasswordResetEmail(eq("user@example.com"), any(), eq("resetRaw"));
        assertThat(user.getPasswordResetToken()).isEqualTo("resetHash");
    }

    @Test
    void forgotPassword_shouldNotRevealNonExistentEmail() {
        when(userRepository.findByEmail("ghost@example.com")).thenReturn(Optional.empty());

        assertThatNoException().isThrownBy(() -> authService.forgotPassword("ghost@example.com"));
        verifyNoInteractions(emailService);
    }

    // --- resetPassword ---

    @Test
    void resetPassword_shouldHashNewPasswordAndRevokeTokens() {
        User user = buildVerifiedUser(true);
        user.setPasswordResetToken("resetHash");
        user.setPasswordResetExpiresAt(LocalDateTime.now().plusMinutes(30));

        when(jwtService.hashToken("rawReset")).thenReturn("resetHash");
        when(userRepository.findByPasswordResetToken("resetHash")).thenReturn(Optional.of(user));
        when(passwordEncoder.encode("NewPassword1")).thenReturn("$2a$new");
        when(userRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        authService.resetPassword("rawReset", "NewPassword1");

        assertThat(user.getPasswordHash()).isEqualTo("$2a$new");
        assertThat(user.getPasswordResetToken()).isNull();
        verify(refreshTokenRepository).revokeAllByUserId(eq(user.getId()), any());
    }

    @Test
    void resetPassword_shouldThrowWhenTokenExpired() {
        User user = buildVerifiedUser(true);
        user.setPasswordResetToken("expiredHash");
        user.setPasswordResetExpiresAt(LocalDateTime.now().minusMinutes(1));

        when(jwtService.hashToken("rawExpired")).thenReturn("expiredHash");
        when(userRepository.findByPasswordResetToken("expiredHash")).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> authService.resetPassword("rawExpired", "NewPassword1"))
            .isInstanceOf(InvalidResetTokenException.class);
    }

    // --- helpers ---

    private User buildVerifiedUser(boolean emailVerified) {
        return User.builder()
            .id(UUID.randomUUID())
            .name("Test User")
            .email("user@example.com")
            .passwordHash("$2a$12$hash")
            .emailVerified(emailVerified)
            .createdAt(LocalDateTime.now())
            .updatedAt(LocalDateTime.now())
            .build();
    }
}
