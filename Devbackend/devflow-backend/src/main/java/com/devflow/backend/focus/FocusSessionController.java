package com.devflow.backend.focus;
import com.devflow.backend.activity.ActivityLog;
import com.devflow.backend.activity.ActivityLogRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
@RestController
@RequestMapping("/api/focus-sessions")
@CrossOrigin(origins = "http://localhost:5173")
public class FocusSessionController {
    private final FocusSessionRepository repository;
    private final ActivityLogRepository activityLogRepository;
    public FocusSessionController(FocusSessionRepository repository,ActivityLogRepository activityLogRepository) {
        this.repository = repository;
        this.activityLogRepository = activityLogRepository;
    }
    @GetMapping
    public List<FocusSession> getAllSessions() {
        return repository.findAll();
    }
    @GetMapping("/{id}")
    public ResponseEntity<FocusSession> getSessionById(
            @PathVariable Long id) {
        return repository.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }
    @PostMapping
    public ResponseEntity<?> createSession(
            @RequestBody FocusSession session) {
        if (session.getTitle() == null || session.getTitle().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message","Session title is required"));
        }
        if (session.getDurationMinutes() == null || session.getDurationMinutes() < 1 || session.getDurationMinutes() > 480) {
            return ResponseEntity.badRequest().body(Map.of("message","Duration must be between 1 and 480 minutes"));
        }
        session.setId(null);
        session.setStartedAt(LocalDateTime.now());
        session.setCompletedAt(null);
        session.setElapsedMinutes(0);
        session.setStatus("IN_PROGRESS");
        FocusSession savedSession = repository.save(session);
        saveActivity("Focus Session","Focus session started","Started focus session: " + savedSession.getTitle());
        return ResponseEntity.status(HttpStatus.CREATED).body(savedSession);
    }
    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        FocusSession session = repository.findById(id).orElse(null);
        if (session == null) {
            return ResponseEntity.notFound().build();
        }
        String status = request.get("status");
        if (status == null
                || !(status.equals("IN_PROGRESS")
                || status.equals("PAUSED")
                || status.equals("COMPLETED"))) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message","Invalid session status"));
        }
        session.setStatus(status);
        if (status.equals("COMPLETED")) {
            session.setCompletedAt(LocalDateTime.now());
        } else {
            session.setCompletedAt(null);
        }
        FocusSession savedSession = repository.save(session);
        if (status.equals("COMPLETED")) {
            saveActivity("Focus Session","Focus session completed","Completed focus session: " + savedSession.getTitle());
        } else if (status.equals("PAUSED")) {
            saveActivity("Focus Session","Focus session paused","Paused focus session: " + savedSession.getTitle());
        } else {
            saveActivity("Focus Session","Focus session resumed","Resumed focus session: " + savedSession.getTitle());
        }
        return ResponseEntity.ok(savedSession);
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSession(
            @PathVariable Long id) {
        FocusSession session = repository.findById(id).orElse(null);
        if (session == null) {
            return ResponseEntity.notFound().build();
        }
        saveActivity("Focus Session","Focus session deleted","Deleted focus session: " + session.getTitle());
        repository.delete(session);
        return ResponseEntity.noContent().build();
    }
    private void saveActivity(String type,String title,String description) {
        ActivityLog activity = new ActivityLog(type,title,description);
        activityLogRepository.save(activity);
    }
}