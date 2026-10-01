package space.orbitta.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import space.orbitta.backend.entity.SupportTicket;

import java.util.List;

public interface SupportTicketRepository
        extends JpaRepository<SupportTicket, Long> {

    List<SupportTicket>
    findByUserIdOrderByUpdatedAtDesc(
            Long userId
    );

    List<SupportTicket>
    findAllByOrderByUpdatedAtDesc();
}
