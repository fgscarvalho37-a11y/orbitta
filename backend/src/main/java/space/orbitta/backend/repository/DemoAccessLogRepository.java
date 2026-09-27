package space.orbitta.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import space.orbitta.backend.entity.DemoAccessLog;

import java.util.List;

public interface DemoAccessLogRepository
        extends JpaRepository<DemoAccessLog, Long> {

    long countByUserId(
            Long userId
    );

    List<DemoAccessLog>
    findTop10ByUserIdOrderByAccessedAtDesc(
            Long userId
    );
}
