package com.devflow.backend.task;
import java.util.List;
import com.devflow.backend.activity.ActivityLog;
import com.devflow.backend.activity.ActivityLogRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
@RestController
@RequestMapping("/api/tasks")
public class TaskController {
    private final TaskRepository taskRepository;
    private final ActivityLogRepository activityLogRepository;
    public TaskController(
            TaskRepository taskRepository,
            ActivityLogRepository activityLogRepository) {
        this.taskRepository = taskRepository;
        this.activityLogRepository = activityLogRepository;
    }
    @GetMapping
    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }
    @GetMapping("/{id}")
    public Task getTaskById(@PathVariable Long id) {
        return findTask(id);
    }
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Task createTask(@RequestBody Task task) {
        task.setId(null);
        validateTask(task);
        Task savedTask = taskRepository.save(task);
        saveActivity("Task","Task created","Created task: " + savedTask.getTitle());
        return savedTask;
    }
    @PutMapping("/{id}")
    public Task updateTask(
            @PathVariable Long id,
            @RequestBody Task updatedTask) {
        Task existingTask = findTask(id);
        validateTask(updatedTask);
        String previousStatus = existingTask.getStatus();
        existingTask.setTitle(updatedTask.getTitle());
        existingTask.setDescription(updatedTask.getDescription());
        existingTask.setProject(updatedTask.getProject());
        existingTask.setPriority(updatedTask.getPriority());
        existingTask.setStatus(updatedTask.getStatus());
        existingTask.setDueDate(updatedTask.getDueDate());
        Task savedTask = taskRepository.save(existingTask);
        if (!savedTask.getStatus().equals(previousStatus) && "Completed".equalsIgnoreCase(savedTask.getStatus())) {
            saveActivity("Task", "Task completed","Completed task: " + savedTask.getTitle());
        } else {
            saveActivity("Task","Task updated","Updated task: " + savedTask.getTitle());
        }
        return savedTask;
    }
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteTask(@PathVariable Long id) {
        taskRepository.delete(findTask(id));
    }
   private void saveActivity(String type,String title,String description) {
        ActivityLog activity = new ActivityLog(type,title,description);
        activityLogRepository.save(activity);
    }
    private Task findTask(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,"Task not found"));
    }
    private void validateTask(Task task) {
        if (task.getTitle() == null || task.getTitle().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Task title is required");
        }
        if (task.getPriority() == null || task.getPriority().isBlank()) {
            task.setPriority("Medium");
        }
        if (task.getStatus() == null || task.getStatus().isBlank()) {
            task.setStatus("To Do");
        }
    }
}
