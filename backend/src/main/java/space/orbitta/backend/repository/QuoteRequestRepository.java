package space.orbitta.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import space.orbitta.backend.entity.QuoteRequest;

import java.util.List;

public interface QuoteRequestRepository
        extends JpaRepository<QuoteRequest, Long> {

    List<QuoteRequest> findAllByOrderByCreatedAtDesc();
}
