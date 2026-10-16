package com.devflow.backend.config;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.io.IOException;
import java.util.List;
@Configuration
public class FirebaseAdminConfig {
    @Bean
    public FirebaseApp firebaseApp() throws IOException {
        List<FirebaseApp> apps = FirebaseApp.getApps();
        if (!apps.isEmpty()) {
            return apps.get(0);
        }
        FirebaseOptions options = FirebaseOptions.builder().setCredentials(GoogleCredentials.getApplicationDefault()).build();
        return FirebaseApp.initializeApp(options);
    }
}
