package com.devflow.backend.team;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
@Repository
public interface TeamMemberRepository
        extends JpaRepository<TeamMember, Long> {
    boolean existsByEmailIgnoreCase(String email);
}
