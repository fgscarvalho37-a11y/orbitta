package space.orbitta.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import space.orbitta.backend.entity.SiteProjectMessage;
import java.util.List;

public interface SiteProjectMessageRepository extends JpaRepository<SiteProjectMessage, Long> {
    List<SiteProjectMessage> findByProjectIdOrderByCreatedAtAscIdAsc(Long projectId);
}
