package com.adminpersonal.shared.security;

import com.adminpersonal.deployment.domain.exception.EncryptionException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.Mac;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Arrays;
import java.util.Base64;
import java.util.UUID;

/**
 * AES-256-GCM encryption service with per-user keys derived via HKDF-SHA256.
 *
 * <p>The master key is provided via configuration and HKDF-derives a deterministic
 * 256-bit subkey per user (using the user's UUID as salt input). Each encrypted
 * payload uses a random 96-bit IV (prepended to the ciphertext) and a 128-bit
 * authentication tag.</p>
 *
 * <p>Wire format (Base64-encoded): {@code IV(12B) || CIPHERTEXT_WITH_TAG}.</p>
 */
@Service
public class EncryptionService {

    private static final String INFO_CONTEXT = "adminpersonal-v1";
    private static final int IV_LENGTH_BYTES = 12;
    private static final int AUTH_TAG_BITS = 128;
    private static final int AES_KEY_BYTES = 32;

    private final byte[] masterKey;

    public EncryptionService(@Value("${app.encryption.master-key}") String masterKeyBase64) {
        if (masterKeyBase64 == null || masterKeyBase64.isBlank()) {
            throw new IllegalStateException("app.encryption.master-key no configurada");
        }
        this.masterKey = Base64.getDecoder().decode(masterKeyBase64);
        if (this.masterKey.length < 32) {
            throw new IllegalStateException("Master key debe ser al menos 32 bytes (256 bits)");
        }
    }

    public String encrypt(String plaintext, UUID userId) {
        try {
            byte[] iv = new byte[IV_LENGTH_BYTES];
            new SecureRandom().nextBytes(iv);
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.ENCRYPT_MODE, deriveKey(userId), new GCMParameterSpec(AUTH_TAG_BITS, iv));
            byte[] cipherWithTag = cipher.doFinal(plaintext.getBytes(StandardCharsets.UTF_8));
            byte[] result = new byte[IV_LENGTH_BYTES + cipherWithTag.length];
            System.arraycopy(iv, 0, result, 0, IV_LENGTH_BYTES);
            System.arraycopy(cipherWithTag, 0, result, IV_LENGTH_BYTES, cipherWithTag.length);
            return Base64.getEncoder().encodeToString(result);
        } catch (Exception e) {
            throw new EncryptionException("Error cifrando valor: " + e.getMessage());
        }
    }

    public String decrypt(String encryptedBase64, UUID userId) {
        try {
            byte[] data = Base64.getDecoder().decode(encryptedBase64);
            if (data.length < IV_LENGTH_BYTES + 16) {
                throw new EncryptionException("Payload cifrado inválido");
            }
            byte[] iv = Arrays.copyOfRange(data, 0, IV_LENGTH_BYTES);
            byte[] cipherWithTag = Arrays.copyOfRange(data, IV_LENGTH_BYTES, data.length);
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.DECRYPT_MODE, deriveKey(userId), new GCMParameterSpec(AUTH_TAG_BITS, iv));
            return new String(cipher.doFinal(cipherWithTag), StandardCharsets.UTF_8);
        } catch (EncryptionException e) {
            throw e;
        } catch (Exception e) {
            throw new EncryptionException("Error descifrando valor: " + e.getMessage());
        }
    }

    /** HKDF-SHA256: extract + expand. Returns 256-bit key derived deterministically by userId. */
    private SecretKey deriveKey(UUID userId) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            // Extract: PRK = HMAC(masterKey, userId)
            mac.init(new SecretKeySpec(masterKey, "HmacSHA256"));
            byte[] prk = mac.doFinal(userId.toString().getBytes(StandardCharsets.UTF_8));
            // Expand: OKM = HMAC(PRK, info || 0x01)
            mac.init(new SecretKeySpec(prk, "HmacSHA256"));
            byte[] infoWithCounter = new byte[INFO_CONTEXT.length() + 1];
            System.arraycopy(INFO_CONTEXT.getBytes(StandardCharsets.UTF_8), 0, infoWithCounter, 0, INFO_CONTEXT.length());
            infoWithCounter[INFO_CONTEXT.length()] = 0x01;
            byte[] okm = mac.doFinal(infoWithCounter);
            return new SecretKeySpec(Arrays.copyOf(okm, AES_KEY_BYTES), "AES");
        } catch (Exception e) {
            throw new EncryptionException("Error derivando clave: " + e.getMessage());
        }
    }
}
