package com.adminpersonal.shared.exception;

import com.adminpersonal.auth.domain.exception.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    record ErrorResponse(int status, String error, String message, String timestamp) {}

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
            .map(f -> f.getField() + ": " + f.getDefaultMessage())
            .collect(Collectors.joining(", "));
        return ResponseEntity.badRequest()
            .body(new ErrorResponse(400, "VALIDATION_ERROR", message, now()));
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(404)
            .body(new ErrorResponse(404, "NOT_FOUND", ex.getMessage(), now()));
    }

    @ExceptionHandler(EmailAlreadyExistsException.class)
    public ResponseEntity<ErrorResponse> handleEmailConflict(EmailAlreadyExistsException ex) {
        return ResponseEntity.status(409)
            .body(new ErrorResponse(409, "EMAIL_ALREADY_EXISTS", ex.getMessage(), now()));
    }

    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleInvalidCredentials(InvalidCredentialsException ex) {
        return ResponseEntity.status(401)
            .body(new ErrorResponse(401, "INVALID_CREDENTIALS", ex.getMessage(), now()));
    }

    @ExceptionHandler(EmailNotVerifiedException.class)
    public ResponseEntity<ErrorResponse> handleEmailNotVerified(EmailNotVerifiedException ex) {
        return ResponseEntity.status(403)
            .body(new ErrorResponse(403, "EMAIL_NOT_VERIFIED", ex.getMessage(), now()));
    }

    @ExceptionHandler({InvalidVerificationTokenException.class, InvalidResetTokenException.class})
    public ResponseEntity<ErrorResponse> handleInvalidToken(RuntimeException ex) {
        return ResponseEntity.badRequest()
            .body(new ErrorResponse(400, "INVALID_TOKEN", ex.getMessage(), now()));
    }

    @ExceptionHandler(InvalidRefreshTokenException.class)
    public ResponseEntity<ErrorResponse> handleInvalidRefreshToken(InvalidRefreshTokenException ex) {
        return ResponseEntity.status(401)
            .body(new ErrorResponse(401, "INVALID_REFRESH_TOKEN", ex.getMessage(), now()));
    }

    @ExceptionHandler(com.adminpersonal.task.domain.exception.InvalidStateTransitionException.class)
    public ResponseEntity<ErrorResponse> handleInvalidTransition(RuntimeException ex) {
        return ResponseEntity.badRequest()
            .body(new ErrorResponse(400, "INVALID_TRANSITION", ex.getMessage(), now()));
    }

    @ExceptionHandler(com.adminpersonal.task.domain.exception.ClosingCommentRequiredException.class)
    public ResponseEntity<ErrorResponse> handleClosingComment(RuntimeException ex) {
        return ResponseEntity.badRequest()
            .body(new ErrorResponse(400, "CLOSING_COMMENT_REQUIRED", ex.getMessage(), now()));
    }

    @ExceptionHandler(com.adminpersonal.task.domain.exception.SubtasksNotCompletedException.class)
    public ResponseEntity<ErrorResponse> handleSubtasksNotCompleted(RuntimeException ex) {
        return ResponseEntity.status(409)
            .body(new ErrorResponse(409, "SUBTASKS_NOT_COMPLETED", ex.getMessage(), now()));
    }

    @ExceptionHandler({
        com.adminpersonal.task.domain.exception.SystemTaskTypeModificationException.class,
        com.adminpersonal.task.domain.exception.MaxSubtaskDepthException.class,
        com.adminpersonal.task.domain.exception.TaskTypeNotDeletableException.class
    })
    public ResponseEntity<ErrorResponse> handleTaskRules(RuntimeException ex) {
        return ResponseEntity.badRequest()
            .body(new ErrorResponse(400, "BUSINESS_RULE_VIOLATION", ex.getMessage(), now()));
    }

    @ExceptionHandler(com.adminpersonal.finance.domain.exception.FutureDateException.class)
    public ResponseEntity<ErrorResponse> handleFutureDate(RuntimeException ex) {
        return ResponseEntity.status(422)
            .body(new ErrorResponse(422, "FUTURE_DATE_NOT_ALLOWED", ex.getMessage(), now()));
    }

    @ExceptionHandler(com.adminpersonal.finance.domain.exception.SystemCategoryModificationException.class)
    public ResponseEntity<ErrorResponse> handleSystemCategory(RuntimeException ex) {
        return ResponseEntity.status(403)
            .body(new ErrorResponse(403, "SYSTEM_CATEGORY_NOT_MODIFIABLE", ex.getMessage(), now()));
    }

    @ExceptionHandler(com.adminpersonal.finance.domain.exception.CategoryNotDeletableException.class)
    public ResponseEntity<ErrorResponse> handleCategoryNotDeletable(RuntimeException ex) {
        return ResponseEntity.status(409)
            .body(new ErrorResponse(409, "CATEGORY_IN_USE", ex.getMessage(), now()));
    }

    @ExceptionHandler(com.adminpersonal.finance.domain.exception.DuplicateBudgetException.class)
    public ResponseEntity<ErrorResponse> handleDuplicateBudget(RuntimeException ex) {
        return ResponseEntity.status(409)
            .body(new ErrorResponse(409, "DUPLICATE_BUDGET", ex.getMessage(), now()));
    }

    @ExceptionHandler(org.springframework.security.access.AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(Exception ex) {
        return ResponseEntity.status(403)
            .body(new ErrorResponse(403, "ACCESS_DENIED", "No tienes permiso para acceder a este recurso", now()));
    }

    @ExceptionHandler(com.adminpersonal.habit.domain.exception.HabitNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleHabitNotFound(RuntimeException ex) {
        return ResponseEntity.status(404)
            .body(new ErrorResponse(404, "NOT_FOUND", ex.getMessage(), now()));
    }

    @ExceptionHandler(com.adminpersonal.habit.domain.exception.HabitCategoryInUseException.class)
    public ResponseEntity<ErrorResponse> handleHabitCategoryInUse(RuntimeException ex) {
        return ResponseEntity.status(409)
            .body(new ErrorResponse(409, "CATEGORY_IN_USE", ex.getMessage(), now()));
    }

    @ExceptionHandler(com.adminpersonal.habit.domain.exception.BlockOverlapException.class)
    public ResponseEntity<ErrorResponse> handleBlockOverlap(RuntimeException ex) {
        return ResponseEntity.status(409)
            .body(new ErrorResponse(409, "BLOCK_OVERLAP", ex.getMessage(), now()));
    }

    @ExceptionHandler(com.adminpersonal.habit.domain.exception.InvalidBlockTypeException.class)
    public ResponseEntity<ErrorResponse> handleInvalidBlockType(RuntimeException ex) {
        return ResponseEntity.badRequest()
            .body(new ErrorResponse(400, "INVALID_BLOCK_TYPE", ex.getMessage(), now()));
    }

    @ExceptionHandler(com.adminpersonal.habit.domain.exception.RoutineDayConflictException.class)
    public ResponseEntity<ErrorResponse> handleRoutineDayConflict(RuntimeException ex) {
        return ResponseEntity.status(409)
            .body(new ErrorResponse(409, "ROUTINE_DAY_CONFLICT", ex.getMessage(), now()));
    }

    @ExceptionHandler(com.adminpersonal.habit.domain.exception.TemplateNotApplicableException.class)
    public ResponseEntity<ErrorResponse> handleTemplateNotApplicable(RuntimeException ex) {
        return ResponseEntity.badRequest()
            .body(new ErrorResponse(400, "TEMPLATE_NOT_APPLICABLE", ex.getMessage(), now()));
    }

    @ExceptionHandler(com.adminpersonal.habit.domain.exception.SamsungIntegrationException.class)
    public ResponseEntity<ErrorResponse> handleSamsungIntegration(RuntimeException ex) {
        return ResponseEntity.status(503)
            .body(new ErrorResponse(503, "SAMSUNG_INTEGRATION_ERROR", ex.getMessage(), now()));
    }

    @ExceptionHandler(com.adminpersonal.project.domain.exception.ProjectNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleProjectNotFound(RuntimeException ex) {
        return ResponseEntity.status(404)
            .body(new ErrorResponse(404, "NOT_FOUND", ex.getMessage(), now()));
    }

    @ExceptionHandler(com.adminpersonal.project.domain.exception.InvalidProjectStateTransitionException.class)
    public ResponseEntity<ErrorResponse> handleInvalidProjectTransition(RuntimeException ex) {
        return ResponseEntity.badRequest()
            .body(new ErrorResponse(400, "INVALID_PROJECT_TRANSITION", ex.getMessage(), now()));
    }

    @ExceptionHandler(com.adminpersonal.project.domain.exception.ProjectInProgressException.class)
    public ResponseEntity<ErrorResponse> handleProjectInProgress(RuntimeException ex) {
        return ResponseEntity.status(422)
            .body(new ErrorResponse(422, "PROJECT_IN_PROGRESS", ex.getMessage(), now()));
    }

    @ExceptionHandler(com.adminpersonal.project.domain.exception.ProjectCategoryInUseException.class)
    public ResponseEntity<ErrorResponse> handleProjectCategoryInUse(RuntimeException ex) {
        return ResponseEntity.status(409)
            .body(new ErrorResponse(409, "CATEGORY_IN_USE", ex.getMessage(), now()));
    }

    @ExceptionHandler({
        com.adminpersonal.project.domain.exception.IterationNumberConflictException.class,
        com.adminpersonal.project.domain.exception.MultipleActiveIterationsException.class
    })
    public ResponseEntity<ErrorResponse> handleIterationConflict(RuntimeException ex) {
        return ResponseEntity.status(409)
            .body(new ErrorResponse(409, "ITERATION_CONFLICT", ex.getMessage(), now()));
    }

    @ExceptionHandler(com.adminpersonal.project.domain.exception.DuplicateTechException.class)
    public ResponseEntity<ErrorResponse> handleDuplicateTech(RuntimeException ex) {
        return ResponseEntity.status(409)
            .body(new ErrorResponse(409, "DUPLICATE_TECH", ex.getMessage(), now()));
    }

    @ExceptionHandler(com.adminpersonal.project.domain.exception.InvalidUrlException.class)
    public ResponseEntity<ErrorResponse> handleInvalidUrl(RuntimeException ex) {
        return ResponseEntity.badRequest()
            .body(new ErrorResponse(400, "INVALID_URL", ex.getMessage(), now()));
    }

    @ExceptionHandler(com.adminpersonal.deployment.domain.exception.DeploymentNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleDeploymentNotFound(RuntimeException ex) {
        return ResponseEntity.status(404)
            .body(new ErrorResponse(404, "NOT_FOUND", ex.getMessage(), now()));
    }

    @ExceptionHandler(com.adminpersonal.deployment.domain.exception.DeploymentDeletedException.class)
    public ResponseEntity<ErrorResponse> handleDeploymentDeleted(RuntimeException ex) {
        return ResponseEntity.status(410)
            .body(new ErrorResponse(410, "DEPLOYMENT_DELETED", ex.getMessage(), now()));
    }

    @ExceptionHandler(com.adminpersonal.deployment.domain.exception.EnvVarDuplicateKeyException.class)
    public ResponseEntity<ErrorResponse> handleEnvVarDuplicate(RuntimeException ex) {
        return ResponseEntity.status(409)
            .body(new ErrorResponse(409, "ENV_VAR_DUPLICATE_KEY", ex.getMessage(), now()));
    }

    @ExceptionHandler(com.adminpersonal.deployment.domain.exception.InvalidWebhookPayloadException.class)
    public ResponseEntity<ErrorResponse> handleInvalidWebhookPayload(RuntimeException ex) {
        return ResponseEntity.badRequest()
            .body(new ErrorResponse(400, "INVALID_WEBHOOK_PAYLOAD", ex.getMessage(), now()));
    }

    @ExceptionHandler(com.adminpersonal.deployment.domain.exception.EncryptionException.class)
    public ResponseEntity<ErrorResponse> handleEncryption(RuntimeException ex) {
        return ResponseEntity.status(500)
            .body(new ErrorResponse(500, "ENCRYPTION_ERROR", ex.getMessage(), now()));
    }

    @ExceptionHandler(com.adminpersonal.deployment.domain.exception.PlatformApiException.class)
    public ResponseEntity<ErrorResponse> handlePlatformApi(RuntimeException ex) {
        return ResponseEntity.status(502)
            .body(new ErrorResponse(502, "PLATFORM_API_ERROR", ex.getMessage(), now()));
    }

    @ExceptionHandler(com.adminpersonal.task.domain.exception.AiServiceUnavailableException.class)
    public ResponseEntity<ErrorResponse> handleAiUnavailable(RuntimeException ex) {
        return ResponseEntity.status(503)
            .body(new ErrorResponse(503, "AI_SERVICE_UNAVAILABLE", ex.getMessage(), now()));
    }

    @ExceptionHandler(com.adminpersonal.client.domain.exception.ClientNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleClientNotFound(RuntimeException ex) {
        return ResponseEntity.status(404)
            .body(new ErrorResponse(404, "NOT_FOUND", ex.getMessage(), now()));
    }

    @ExceptionHandler(com.adminpersonal.domain.domain.exception.DomainNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleDomainNotFound(RuntimeException ex) {
        return ResponseEntity.status(404)
            .body(new ErrorResponse(404, "NOT_FOUND", ex.getMessage(), now()));
    }

    @ExceptionHandler(com.adminpersonal.domain.domain.exception.DomainDuplicateException.class)
    public ResponseEntity<ErrorResponse> handleDomainDuplicate(RuntimeException ex) {
        return ResponseEntity.status(409)
            .body(new ErrorResponse(409, "DOMAIN_DUPLICATE", ex.getMessage(), now()));
    }

    @ExceptionHandler(com.adminpersonal.domain.domain.exception.SubdomainPrefixInvalidException.class)
    public ResponseEntity<ErrorResponse> handleSubdomainPrefix(RuntimeException ex) {
        return ResponseEntity.badRequest()
            .body(new ErrorResponse(400, "SUBDOMAIN_PREFIX_INVALID", ex.getMessage(), now()));
    }

    @ExceptionHandler(com.adminpersonal.domain.domain.exception.NameserverLimitExceededException.class)
    public ResponseEntity<ErrorResponse> handleNameserverLimit(RuntimeException ex) {
        return ResponseEntity.status(422)
            .body(new ErrorResponse(422, "NAMESERVER_LIMIT_EXCEEDED", ex.getMessage(), now()));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity.status(422)
            .body(new ErrorResponse(422, "BUSINESS_RULE_VIOLATION", ex.getMessage(), now()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneric(Exception ex) {
        return ResponseEntity.status(500)
            .body(new ErrorResponse(500, "INTERNAL_ERROR", "Error interno del servidor", now()));
    }

    private String now() {
        return java.time.Instant.now().toString();
    }
}
