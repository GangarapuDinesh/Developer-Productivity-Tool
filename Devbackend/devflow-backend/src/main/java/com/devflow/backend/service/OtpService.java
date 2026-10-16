package com.devflow.backend.service;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.HexFormat;
import java.util.Locale;
import java.util.concurrent.ConcurrentHashMap;
@Service
public class OtpService {
    private static final long OTP_VALIDITY_SECONDS = 300;
    private static final long RESEND_COOLDOWN_SECONDS = 60;
    private static final int MAX_ATTEMPTS = 5;
    private final ConcurrentHashMap<String, OtpEntry> otpStore = new ConcurrentHashMap<>();
    private final SecureRandom secureRandom = new SecureRandom();
    private final EmailService emailService;
    public OtpService(EmailService emailService) {
        this.emailService = emailService;
    }
    public void sendOtp(String email) {
        String normalizedEmail = normalizeEmail(email);
        String otp = String.format("%06d",secureRandom.nextInt(1_000_000));
        long now = Instant.now().getEpochSecond();
        OtpEntry newEntry = new OtpEntry(hashOtp(otp),now,now + OTP_VALIDITY_SECONDS, 0);
        otpStore.compute(normalizedEmail, (key, existing) -> {
            long currentTime = Instant.now().getEpochSecond();
            if (existing != null && currentTime - existing.createdAt() < RESEND_COOLDOWN_SECONDS) {
                throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "Please wait 60 seconds before requesting another OTP");
            }
            return newEntry;
        });
        try {
            emailService.sendOtpEmail(normalizedEmail, otp);
        } catch (Exception exception) {
            otpStore.remove(normalizedEmail, newEntry);
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Unable to send OTP email. Check mail configuration and try again");
        }
    }
    public void verifyOtp(String email, String otp) {
        String normalizedEmail = normalizeEmail(email);
        if (otp == null || !otp.matches("[0-9]{6}")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Enter a valid six-digit OTP");
        }
        long now = Instant.now().getEpochSecond();
        String[] result = new String[1];
        otpStore.compute(normalizedEmail, (key, entry) -> {
            if (entry == null) {
                result[0] = "INVALID";
                return null;
            }
            if (now >= entry.expiresAt()) {
                result[0] = "EXPIRED";
                return null;
            }
            if (entry.attempts() >= MAX_ATTEMPTS) {
                result[0] = "TOO_MANY";
                return null;
            }
            boolean matches = MessageDigest.isEqual(entry.otpHash().getBytes(StandardCharsets.UTF_8),hashOtp(otp).getBytes(StandardCharsets.UTF_8));
            if (matches) {
                result[0] = "SUCCESS";
                return null;
            }
            int updatedAttempts = entry.attempts() + 1;
            if (updatedAttempts >= MAX_ATTEMPTS) {
                result[0] = "TOO_MANY";
                return null;
            }
            result[0] = "INCORRECT";
            return new OtpEntry(
                    entry.otpHash(),
                    entry.createdAt(),
                    entry.expiresAt(),
                    updatedAttempts
            );
        });

        if ("SUCCESS".equals(result[0])) {
            return;
        }

        if ("TOO_MANY".equals(result[0])) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,"Too many incorrect OTP attempts. Request a new OTP");
        }
        if ("EXPIRED".equals(result[0])) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,"OTP expired. Request a new OTP");
        }
        if ("INCORRECT".equals(result[0])) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Incorrect OTP. Please check the code and try again");
        }
        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Invalid or expired OTP. Request a new OTP");
    }
    private String normalizeEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Email address is required");
        }
        return email.trim().toLowerCase(Locale.ROOT);
    }
    private String hashOtp(String otp) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(otp.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception exception) {
            throw new IllegalStateException("Unable to process OTP",exception);
        }
    }
    private record OtpEntry(String otpHash,long createdAt,long expiresAt,int attempts) {
    }
}
