package com.devflow.backend.focus;
import jakarta.persistence.*;
import java.time.LocalDateTime;
@Entity
@Table(name = "focus_sessions")
public class FocusSession {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String title;
    private Integer durationMinutes;
    private Integer elapsedMinutes = 0;
    private String status = "IN_PROGRESS";
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    public FocusSession() {
    }
    @PrePersist
    public void onCreate() {
        if (startedAt == null) {
            startedAt = LocalDateTime.now();
        }
        if (status == null || status.isBlank()) {
            status = "IN_PROGRESS";
        }
        if (elapsedMinutes == null) {
            elapsedMinutes = 0;
        }
    }
    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public String getTitle() {
        return title;
    }
    public void setTitle(String title) {
        this.title = title;
    }
    public Integer getDurationMinutes() {
        return durationMinutes;
    }
    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
    }
    public Integer getElapsedMinutes() {
        return elapsedMinutes;
    }
    public void setElapsedMinutes(Integer elapsedMinutes) {
        this.elapsedMinutes = elapsedMinutes;
    }
    public String getStatus() {
        return status;
    }
    public void setStatus(String status) {
        this.status = status;
    }
    public LocalDateTime getStartedAt() {
        return startedAt;
    }
    public void setStartedAt(LocalDateTime startedAt) {
        this.startedAt = startedAt;
    }
    public LocalDateTime getCompletedAt() {
        return completedAt;
    }
    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }
}
