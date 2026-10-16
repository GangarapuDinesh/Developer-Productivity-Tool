package com.devflow.backend.dto;
import jakarta.validation.constraints.NotBlank;
public record FirebaseLoginRequest(
        @NotBlank(message = "Firebase ID token is required")
        String idToken
) {}
