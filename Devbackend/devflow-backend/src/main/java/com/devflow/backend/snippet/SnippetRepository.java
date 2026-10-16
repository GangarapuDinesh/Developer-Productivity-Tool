package com.devflow.backend.snippet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
@Repository
public interface SnippetRepository extends JpaRepository<Snippet, Long> {
}
