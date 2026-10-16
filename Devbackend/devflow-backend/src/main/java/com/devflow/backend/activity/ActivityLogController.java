package com.devflow.backend.activity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
@RestController
@RequestMapping("/api/activities")
@CrossOrigin(origins = "http://localhost:5173")
public class ActivityLogController {
    private final ActivityLogRepository activityLogRepository;
    public ActivityLogController(
            ActivityLogRepository activityLogRepository) {
        this.activityLogRepository = activityLogRepository;
    }
    @GetMapping
    public List<ActivityLog> getAllActivities() {
        return activityLogRepository.findAll(
                org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC,"createdAt")
        );
    }
    @GetMapping("/{id}")
    public ActivityLog getActivityById(@PathVariable Long id) {
        return activityLogRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Activity not found"
                ));
    }
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ActivityLog createActivity(
            @RequestBody ActivityLog activity) {
        if (activity.getType() == null || activity.getType().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Activity type is required");
        }
        if (activity.getTitle() == null
                || activity.getTitle().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Activity title is required");
        }
        activity.setType(activity.getType().trim());
        activity.setTitle(activity.getTitle().trim());
        if (activity.getDescription() != null) {
            activity.setDescription(
                    activity.getDescription().trim()
            );
        }
       activity.setCreatedAt(null);
        return activityLogRepository.save(activity);
    }
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteActivity(@PathVariable Long id) {
        if (!activityLogRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Activity not found");
        }
        activityLogRepository.deleteById(id);
    }
}
