package com.devflow.backend.snippet;
import java.util.List;
import com.devflow.backend.activity.ActivityLog;
import com.devflow.backend.activity.ActivityLogRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
@RestController
@RequestMapping("/api/snippets")
@CrossOrigin(origins = "http://localhost:5173")
public class SnippetController {
    private final SnippetRepository snippetRepository;
    private final ActivityLogRepository activityLogRepository;
    public SnippetController(SnippetRepository snippetRepository,ActivityLogRepository activityLogRepository) {
        this.snippetRepository = snippetRepository;
        this.activityLogRepository = activityLogRepository;
    }
    @GetMapping
    public List<Snippet> getAllSnippets() {
        return snippetRepository.findAll();
    }
    @GetMapping("/{id}")
    public Snippet getSnippetById(@PathVariable Long id) {
        return findSnippet(id);
    }
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Snippet createSnippet(@RequestBody Snippet snippet) {
        snippet.setId(null);
        validateSnippet(snippet);
        Snippet savedSnippet = snippetRepository.save(snippet);
        saveActivity("Snippet","Snippet created","Saved code snippet: " + savedSnippet.getTitle());
        return savedSnippet;
    }
    @PutMapping("/{id}")
    public Snippet updateSnippet(
            @PathVariable Long id,
            @RequestBody Snippet updatedSnippet) {
        Snippet existingSnippet = findSnippet(id);
        validateSnippet(updatedSnippet);
        existingSnippet.setTitle(updatedSnippet.getTitle());
        existingSnippet.setLanguage(updatedSnippet.getLanguage());
        existingSnippet.setCode(updatedSnippet.getCode());
        existingSnippet.setDescription(updatedSnippet.getDescription());
        Snippet savedSnippet = snippetRepository.save(existingSnippet);
        saveActivity("Snippet","Snippet updated","Updated code snippet: " + savedSnippet.getTitle());
        return savedSnippet;
    }
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteSnippet(@PathVariable Long id) {
        Snippet snippet = findSnippet(id);
        snippetRepository.delete(snippet);
    }
    private Snippet findSnippet(Long id) {
        return snippetRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,"Snippet not found"));
    }
    private void validateSnippet(Snippet snippet) {
        if (snippet.getTitle() == null || snippet.getTitle().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Snippet title is required");
        }
        if (snippet.getLanguage() == null || snippet.getLanguage().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Snippet language is required");
        }
        if (snippet.getCode() == null || snippet.getCode().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Snippet code is required");
        }
    }
    private void saveActivity(String type,String title,String description) {
        ActivityLog activity = new ActivityLog(type,title,description);
        activityLogRepository.save(activity);
    }
}
