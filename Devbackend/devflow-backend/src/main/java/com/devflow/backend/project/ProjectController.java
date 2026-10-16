package com.devflow.backend.project;
import java.util.List;
import com.devflow.backend.activity.ActivityLog;
import com.devflow.backend.activity.ActivityLogRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
@RestController
@RequestMapping("/api/projects")
public class ProjectController {
    private final ProjectRepository projectRepository;
    private final ActivityLogRepository activityLogRepository;
    public ProjectController(ProjectRepository projectRepository,ActivityLogRepository activityLogRepository) {
        this.projectRepository = projectRepository;
        this.activityLogRepository = activityLogRepository;
    }
    @GetMapping
    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }
    @GetMapping("/{id}")
    public Project getProjectById(@PathVariable Long id) {
        return findProject(id);
    }
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Project createProject(@RequestBody Project project) {
        project.setId(null);
        validateProject(project);
        if (project.getProgress() == null) {
            project.setProgress(0);
        }
        Project savedProject = projectRepository.save(project);
        saveActivity("Project","Project created","Created project: " + savedProject.getName());
        return savedProject;
    }
    @PutMapping("/{id}")
    public Project updateProject(
            @PathVariable Long id,
            @RequestBody Project updatedProject) {
        Project existingProject = findProject(id);
        validateProject(updatedProject);
        existingProject.setName(updatedProject.getName());
        existingProject.setDescription(updatedProject.getDescription());
        existingProject.setTechnology(updatedProject.getTechnology());
        existingProject.setStatus(updatedProject.getStatus());
        existingProject.setProgress(updatedProject.getProgress());
        existingProject.setDeadline(updatedProject.getDeadline());
        Project savedProject = projectRepository.save(existingProject);
        saveActivity("Project","Project updated","Updated project: " + savedProject.getName());
        return savedProject;
    }
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteProject(@PathVariable Long id) {
        projectRepository.delete(findProject(id));
    }
    private void saveActivity(String type,String title,String description) {
        ActivityLog activity = new ActivityLog(type,title,description);
        activityLogRepository.save(activity);
    }
    private Project findProject(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,"Project not found"));
    }
    private void validateProject(Project project) {
        if (project.getName() == null || project.getName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Project name is required");
        }
        if (project.getProgress() != null && (project.getProgress() < 0 || project.getProgress() > 100)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Progress must be between 0 and 100");
        }
        if (project.getStatus() == null || project.getStatus().isBlank()) {
            project.setStatus("Planning");
        }
    }
}
