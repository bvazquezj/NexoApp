package com.adminpersonal.shared.email;

import com.resend.Resend;
import com.resend.core.exception.ResendException;
import com.resend.services.emails.model.CreateEmailOptions;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class ResendEmailService {

    @Value("${resend.api-key}")
    private String apiKey;

    @Value("${resend.from-email}")
    private String fromEmail;

    @Value("${resend.base-url}")
    private String baseUrl;

    private Resend resend;

    @PostConstruct
    public void init() {
        resend = new Resend(apiKey);
    }

    public void sendVerificationEmail(String to, String name, String rawToken) {
        String link = baseUrl + "/verify-email?token=" + rawToken;
        String html = buildVerificationHtml(name, link);
        sendEmail(to, "Verifica tu cuenta - AdminPersonal", html);
    }

    public void sendPasswordResetEmail(String to, String name, String rawToken) {
        String link = baseUrl + "/reset-password?token=" + rawToken;
        String html = buildPasswordResetHtml(name, link);
        sendEmail(to, "Restablece tu contraseña - AdminPersonal", html);
    }

    private void sendEmail(String to, String subject, String html) {
        try {
            CreateEmailOptions request = CreateEmailOptions.builder()
                .from(fromEmail)
                .to(to)
                .subject(subject)
                .html(html)
                .build();
            resend.emails().send(request);
        } catch (ResendException e) {
            // Email failure should not break the auth flow — log and rethrow as unchecked
            throw new RuntimeException("Email send failed: " + e.getMessage(), e);
        }
    }

    private String buildVerificationHtml(String name, String link) {
        return """
            <h2>Hola %s,</h2>
            <p>Verifica tu cuenta haciendo clic en el siguiente enlace:</p>
            <a href="%s">Verificar cuenta</a>
            <p>Este enlace expira en 24 horas.</p>
            """.formatted(name, link);
    }

    private String buildPasswordResetHtml(String name, String link) {
        return """
            <h2>Hola %s,</h2>
            <p>Restablece tu contraseña haciendo clic en el siguiente enlace:</p>
            <a href="%s">Restablecer contraseña</a>
            <p>Este enlace expira en 1 hora. Si no solicitaste esto, ignora este email.</p>
            """.formatted(name, link);
    }
}
