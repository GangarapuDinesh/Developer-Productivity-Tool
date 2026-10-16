package com.devflow.backend.team;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.util.Locale;
@RestController
@RequestMapping("/api/team")
@CrossOrigin(origins = "http://localhost:5173")
public class TeamController {
    private final TeamMemberRepository teamMemberRepository;
    public TeamController(TeamMemberRepository teamMemberRepository) {
        this.teamMemberRepository = teamMemberRepository;
    }
    @GetMapping
    public List<TeamMember> getAllMembers() {
        return teamMemberRepository.findAll();
    }

    @GetMapping("/{id}")
    public TeamMember getMemberById(@PathVariable Long id) {
        return findMember(id);
    }
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TeamMember createMember(@RequestBody TeamMember member) {
        validateMember(member);
        String email = member.getEmail().trim().toLowerCase(Locale.ROOT);
        if (teamMemberRepository.existsByEmailIgnoreCase(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,"A team member with this email already exists.");
        }
        member.setId(null);
        member.setName(member.getName().trim());
        member.setEmail(email);
        return teamMemberRepository.save(member);
    }
    @PutMapping("/{id}")
    public TeamMember updateMember(
            @PathVariable Long id,
            @RequestBody TeamMember updatedMember) {
        TeamMember existingMember = findMember(id);
        validateMember(updatedMember);
        String email = updatedMember.getEmail()
                .trim()
                .toLowerCase(Locale.ROOT);
        boolean emailUsedByAnotherMember = teamMemberRepository.existsByEmailIgnoreCase(email) && !existingMember.getEmail().equalsIgnoreCase(email);
        if (emailUsedByAnotherMember) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,"A team member with this email already exists.");
        }
        existingMember.setName(updatedMember.getName().trim());
        existingMember.setEmail(email);
        existingMember.setRole(updatedMember.getRole());
        existingMember.setDepartment(updatedMember.getDepartment());
        existingMember.setStatus(updatedMember.getStatus());
        return teamMemberRepository.save(existingMember);
    }
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteMember(@PathVariable Long id) {
        TeamMember member = findMember(id);
        teamMemberRepository.delete(member);
    }
    private TeamMember findMember(Long id) {
        return teamMemberRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,"Team member not found."));
    }
    private void validateMember(TeamMember member) {
        if (member.getName() == null
                || member.getName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Member name is required.");
        }
        if (member.getEmail() == null
                || member.getEmail().isBlank()
                || !member.getEmail().matches(
                        "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"A valid email address is required.");
        }
        if (!List.of(
                "Admin",
                "Developer",
                "Designer",
                "Project Manager"
        ).contains(member.getRole())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Invalid team role.");
        }
        if (!List.of(
                "Development",
                "Frontend",
                "Backend",
                "UI/UX Design",
                "Testing",
                "Management"
        ).contains(member.getDepartment())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Invalid department.");
        }
        if (!List.of("Active", "Away").contains(member.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Invalid member status.");
        }
    }
}
