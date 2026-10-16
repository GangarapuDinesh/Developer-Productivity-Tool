package com.devflow.backend.service;
import com.devflow.backend.dto.AuthResponse;
import com.devflow.backend.dto.LoginRequest;
import com.devflow.backend.dto.OtpResponse;
import com.devflow.backend.dto.OtpVerificationRequest;
import com.devflow.backend.dto.RegisterRequest;
import com.devflow.backend.entity.User;
import com.devflow.backend.repository.UserRepository;
import com.devflow.backend.security.JwtService;
import com.google.firebase.FirebaseApp;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.util.Locale;
import java.util.UUID;
@Service
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final FirebaseApp firebaseApp;
    private final OtpService otpService;
    public AuthService(UserRepository userRepository,PasswordEncoder passwordEncoder,JwtService jwtService,FirebaseApp firebaseApp,OtpService otpService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.firebaseApp = firebaseApp;
        this.otpService = otpService;
    }
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = normalizeEmail(request.email());
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,"An account with this email already exists");
        }
        User user = new User();
        user.setFullName(request.fullName().trim());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole("USER");
        User savedUser = userRepository.save(user);
        return new AuthResponse(savedUser.getId(),savedUser.getFullName(),savedUser.getEmail(),savedUser.getRole(),"Registration successful");
    }
    public OtpResponse login(LoginRequest request) {
        String email = normalizeEmail(request.email());
        User user = userRepository.findByEmailIgnoreCase(email)
                .filter(existing ->
                        passwordEncoder.matches(
                                request.password(),
                                existing.getPassword()
                        )
                )
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Invalid email or password"
                ));
        otpService.sendOtp(user.getEmail());
        return new OtpResponse("OTP sent to your registered email address",user.getEmail());
    }
    @Transactional(readOnly = true)
    public LoginResult verifyOtp(OtpVerificationRequest request) {
        String email = normalizeEmail(request.email());
        otpService.verifyOtp(email, request.otp());
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED,"User account not found"));
        String token = jwtService.generateToken(user.getEmail());
        AuthResponse authResponse = new AuthResponse(user.getId(),user.getFullName(),user.getEmail(),user.getRole(),"Login successful");
        return new LoginResult(authResponse, token);
    }
    @Transactional
    public OtpResponse firebaseLogin(String idToken) {
        if (idToken == null || idToken.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Firebase ID token is required");
        }
        FirebaseToken decodedToken;
        try {
            decodedToken = FirebaseAuth.getInstance(firebaseApp)
                    .verifyIdToken(idToken);
        } catch (FirebaseAuthException | IllegalArgumentException exception) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Invalid or expired Firebase ID token");
        }
        String email = decodedToken.getEmail();
        if (email == null || email.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Your Google account did not provide an email address");
        }
        Object emailVerified = decodedToken.getClaims().get("email_verified");

        if (!Boolean.TRUE.equals(emailVerified)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Please use a verified Google email address");
        }
        email = normalizeEmail(email);
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElse(null);
        if (user == null) {
            String name = decodedToken.getName();
            if (name == null || name.isBlank()) {
                name = email.substring(0, email.indexOf('@'));
            }
            user = new User();
            user.setFullName(name);
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
            user.setRole("USER");
            userRepository.save(user);
        }
        otpService.sendOtp(email);
        return new OtpResponse("OTP sent to your Google email address",email);
    }
    private String normalizeEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Email address is required");
        }
        return email.trim().toLowerCase(Locale.ROOT);
    }
    public record LoginResult(AuthResponse user, String token) {
    }
}