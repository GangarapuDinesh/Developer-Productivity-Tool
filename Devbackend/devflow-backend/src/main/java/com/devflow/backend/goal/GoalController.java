package com.devflow.backend.goal;
import com.devflow.backend.activity.ActivityLog;
import com.devflow.backend.activity.ActivityLogRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
@RestController
@RequestMapping("/api/goals")
@CrossOrigin(origins = "http://localhost:5173")
public class GoalController {
    private final GoalRepository goalRepository;
    private final ActivityLogRepository activityLogRepository;
    public GoalController(GoalRepository goalRepository,ActivityLogRepository activityLogRepository) {
        this.goalRepository = goalRepository;
        this.activityLogRepository = activityLogRepository;
    }
    @GetMapping
    public List<Goal> getAllGoals() {
        return goalRepository.findAll();
    }
    @GetMapping("/{id}")
    public Goal getGoalById(@PathVariable Long id) {
        return findGoal(id);
    }
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Goal createGoal(@RequestBody Goal goal) {
        validateGoal(goal);
        goal.setId(null);
        goal.setTitle(goal.getTitle().trim());
        goal.setCategory(goal.getCategory().trim());
        goal.setProgress(Math.min(goal.getProgress(), goal.getTarget()));
        Goal savedGoal = goalRepository.save(goal);
        logActivity("Goal","Goal created","Created goal: " + savedGoal.getTitle());
        return savedGoal;
    }
    @PutMapping("/{id}")
    public Goal updateGoal(
            @PathVariable Long id,
            @RequestBody Goal updatedGoal) {
        Goal existingGoal = findGoal(id);
        validateGoal(updatedGoal);
        existingGoal.setTitle(updatedGoal.getTitle().trim());
        existingGoal.setCategory(updatedGoal.getCategory().trim());
        existingGoal.setTarget(updatedGoal.getTarget());
        existingGoal.setProgress(Math.min(updatedGoal.getProgress(), updatedGoal.getTarget()));
        existingGoal.setDeadline(updatedGoal.getDeadline());
        Goal savedGoal = goalRepository.save(existingGoal);
        logActivity("Goal","Goal updated","Updated goal: " + savedGoal.getTitle());
        return savedGoal;
    }
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteGoal(@PathVariable Long id) {
        Goal goal = findGoal(id);
        logActivity("Goal","Goal deleted","Deleted goal: " + goal.getTitle());
        goalRepository.delete(goal);
    }
    private Goal findGoal(Long id) {
        return goalRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,"Goal not found"));
    }
    private void validateGoal(Goal goal) {
        if (goal.getTitle() == null
                || goal.getTitle().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Goal title is required");
        }
        if (goal.getCategory() == null
                || goal.getCategory().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Goal category is required");
        }
        if (goal.getTarget() == null || goal.getTarget() < 1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Target must be greater than zero");
        }
        if (goal.getProgress() == null || goal.getProgress() < 0 || goal.getProgress() > goal.getTarget()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Progress must be between zero and the target");
        }
    }
    private void logActivity(String type,String title,String description) {
        ActivityLog activity = new ActivityLog(type,title,description);
        activityLogRepository.save(activity);
    }
}