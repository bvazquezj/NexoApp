package com.adminpersonal.auth.infrastructure.web;

import com.adminpersonal.auth.application.dto.request.*;
import com.adminpersonal.auth.application.dto.response.AuthResponse;
import com.adminpersonal.auth.application.service.AuthService;
import com.adminpersonal.shared.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Auth", description = "Registro, login, verificación de email y gestión de tokens")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Registrar nueva cuenta")
    @ApiResponse(responseCode = "201", description = "Cuenta creada, se envió email de verificación")
    @ApiResponse(responseCode = "409", description = "Email ya registrado")
    @SecurityRequirements
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(201).body(authService.register(request));
    }

    @PostMapping("/login")
    @Operation(summary = "Iniciar sesión")
    @ApiResponse(responseCode = "200", description = "Login exitoso")
    @ApiResponse(responseCode = "401", description = "Credenciales incorrectas")
    @ApiResponse(responseCode = "403", description = "Email no verificado")
    @SecurityRequirements
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest) {
        String userAgent = httpRequest.getHeader("User-Agent");
        String ip = httpRequest.getRemoteAddr();
        return ResponseEntity.ok(authService.login(request, userAgent, ip));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Renovar access token")
    @ApiResponse(responseCode = "200", description = "Token renovado")
    @ApiResponse(responseCode = "401", description = "Refresh token inválido o expirado")
    @SecurityRequirements
    public ResponseEntity<AuthResponse> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        return ResponseEntity.ok(authService.refresh(request.refreshToken()));
    }

    @PostMapping("/logout")
    @Operation(summary = "Cerrar sesión (revocar refresh token actual)")
    @SecurityRequirements
    public ResponseEntity<Void> logout(@Valid @RequestBody RefreshTokenRequest request) {
        authService.logout(request.refreshToken());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/logout-all")
    @Operation(summary = "Cerrar todas las sesiones activas")
    @ApiResponse(responseCode = "204", description = "Todas las sesiones revocadas")
    public ResponseEntity<Void> logoutAll() {
        authService.logoutAll(SecurityUtils.getCurrentUserId());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/verify-email")
    @Operation(summary = "Verificar email con token del link")
    @ApiResponse(responseCode = "200", description = "Email verificado, retorna tokens de sesión")
    @ApiResponse(responseCode = "400", description = "Token inválido o expirado")
    @SecurityRequirements
    public ResponseEntity<AuthResponse> verifyEmail(@Valid @RequestBody VerifyEmailRequest request) {
        return ResponseEntity.ok(authService.verifyEmail(request.token()));
    }

    @PostMapping("/resend-verification")
    @Operation(summary = "Reenviar email de verificación")
    @SecurityRequirements
    public ResponseEntity<Void> resendVerification(@Valid @RequestBody ResendVerificationRequest request) {
        authService.resendVerificationEmail(request.email());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Solicitar email de restablecimiento de contraseña")
    @SecurityRequirements
    public ResponseEntity<Void> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request.email());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Restablecer contraseña con token del email")
    @ApiResponse(responseCode = "204", description = "Contraseña restablecida correctamente")
    @ApiResponse(responseCode = "400", description = "Token inválido, expirado o ya usado")
    @SecurityRequirements
    public ResponseEntity<Void> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request.token(), request.newPassword());
        return ResponseEntity.noContent().build();
    }
}
