package space.orbitta.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import space.orbitta.backend.entity.CommercialSettings;

public interface CommercialSettingsRepository
        extends JpaRepository<CommercialSettings, Long> {
}
