package com.adminpersonal.auth.infrastructure.web;

import com.adminpersonal.auth.application.dto.request.ChangePasswordRequest;
import com.adminpersonal.auth.application.dto.request.UpdateProfileRequest;
import com.adminpersonal.auth.application.dto.response.UserProfileResponse;
import com.adminpersonal.auth.application.service.UserService;
import com.adminpersonal.shared.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@Tag(name = "Users", description = "Perfil y gestión de cuenta del usuario autenticado")
@RequiredArgsConstructor
public class UserProfileController {

    private final UserService userService;

    @GetMapping("/me")
    @Operation(summary = "Obtener perfil del usuario autenticado")
    public ResponseEntity<UserProfileResponse> getProfile() {
        return ResponseEntity.ok(userService.getProfile(SecurityUtils.getCurrentUserId()));
    }

    @PutMapping("/me")
    @Operation(summary = "Actualizar nombre del perfil")
    public ResponseEntity<UserProfileResponse> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(userService.updateProfile(SecurityUtils.getCurrentUserId(), request));
    }

    @PutMapping("/me/password")
    @Operation(summary = "Cambiar contraseña")
    @ApiResponse(responseCode = "204", description = "Contraseña actualizada")
    @ApiResponse(responseCode = "400", description = "Contraseña actual incorrecta")
    public ResponseEntity<Void> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        userService.changePassword(SecurityUtils.getCurrentUserId(), request);
        return ResponseEntity.noContent().build();
    }
}
