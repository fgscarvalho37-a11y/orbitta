package space.orbitta.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import space.orbitta.backend.entity.SiteProject;
import java.util.List;
import java.util.Optional;

public interface SiteProjectRepository extends JpaRepository<SiteProject, Long> {
    Optional<SiteProject> findByCheckoutId(Long checkoutId);
    List<SiteProject> findByUserIdOrderByUpdatedAtDesc(Long userId);
    List<SiteProject> findAllByOrderByUpdatedAtDesc();
}
