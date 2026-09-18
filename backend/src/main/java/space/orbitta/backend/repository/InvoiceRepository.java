package space.orbitta.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import space.orbitta.backend.entity.Invoice;
import space.orbitta.backend.entity.InvoiceStatus;

import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceRepository
        extends JpaRepository<Invoice, Long> {

    /*
     * =========================================================
     * CLIENTE
     * =========================================================
     */

    List<Invoice> findByUserIdOrderByDueDateDesc(
            Long userId
    );

    List<Invoice> findByUserIdAndStatusOrderByDueDateDesc(
            Long userId,
            InvoiceStatus status
    );

    List<Invoice> findByProductIdOrderByDueDateDesc(
            Long productId
    );

    Optional<Invoice> findByIdAndUserId(
            Long id,
            Long userId
    );

    Optional<Invoice> findByInvoiceNumber(
            String invoiceNumber
    );

    boolean existsByInvoiceNumber(
            String invoiceNumber
    );

    long countByUserIdAndStatus(
            Long userId,
            InvoiceStatus status
    );

    /*
     * =========================================================
     * ADMIN
     * =========================================================
     */

    List<Invoice> findAllByOrderByCreatedAtDesc();

    long countByStatus(
            InvoiceStatus status
    );
}