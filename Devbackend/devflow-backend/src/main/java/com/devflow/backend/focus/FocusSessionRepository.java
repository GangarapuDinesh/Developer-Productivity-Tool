package com.devflow.backend.focus;
import org.springframework.data.jpa.repository.JpaRepository;
public interface FocusSessionRepository
        extends JpaRepository<FocusSession, Long> {
}
