package space.orbitta.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import space.orbitta.backend.entity.SitePreview;
import java.util.List;
import java.util.Optional;

public interface SitePreviewRepository extends JpaRepository<SitePreview, Long> {
    Optional<SitePreview> findBySlug(String slug);
    List<SitePreview> findAllByOrderByUpdatedAtDesc();
}
