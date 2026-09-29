package space.orbitta.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import space.orbitta.backend.entity.RenewalEmailLog;

import java.time.LocalDate;

@Repository
public interface RenewalEmailLogRepository
        extends JpaRepository<RenewalEmailLog, Long> {

    boolean existsByClientProductIdAndRenewalDateAndReminderStage(
            Long clientProductId,
            LocalDate renewalDate,
            String reminderStage
    );
}
