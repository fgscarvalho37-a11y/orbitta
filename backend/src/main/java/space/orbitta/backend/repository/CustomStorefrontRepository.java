package space.orbitta.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import space.orbitta.backend.entity.CustomStorefront;
import java.util.List;
import java.util.Optional;

public interface CustomStorefrontRepository extends JpaRepository<CustomStorefront,Long> {
    Optional<CustomStorefront> findBySiteSlug(String siteSlug);
    List<CustomStorefront> findAllByOrderByUpdatedAtDesc();
}
