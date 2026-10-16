package com.devflow.backend.controller;
import com.devflow.backend.dto.AuthResponse;
import com.devflow.backend.dto.FirebaseLoginRequest;
import com.devflow.backend.dto.LoginRequest;
import com.devflow.backend.dto.OtpResponse;
import com.devflow.backend.dto.OtpVerificationRequest;
import com.devflow.backend.dto.RegisterRequest;
import com.devflow.backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;
    public AuthController(AuthService authService) {
        this.authService = authService;
    }
    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(
            @Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }
    @PostMapping("/login")
    public OtpResponse login(
            @Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }
    @PostMapping("/verify-otp")
    public AuthService.LoginResult verifyOtp(
            @Valid @RequestBody OtpVerificationRequest request) {
        return authService.verifyOtp(request);
    }
    @PostMapping("/firebase")
    public OtpResponse firebaseLogin(
            @Valid @RequestBody FirebaseLoginRequest request) {
        return authService.firebaseLogin(request.idToken());
    }
}