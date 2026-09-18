package space.orbitta.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import space.orbitta.backend.entity.ClientProduct;
import space.orbitta.backend.entity.ProductStatus;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClientProductRepository
        extends JpaRepository<ClientProduct, Long> {

    /*
     * =========================================================
     * CLIENTE
     * =========================================================
     */

    List<ClientProduct> findByUserIdOrderByCreatedAtDesc(
            Long userId
    );

    List<ClientProduct> findByUserIdAndStatusOrderByCreatedAtDesc(
            Long userId,
            ProductStatus status
    );

    Optional<ClientProduct> findByIdAndUserId(
            Long id,
            Long userId
    );

    long countByUserIdAndStatus(
            Long userId,
            ProductStatus status
    );

    /*
     * =========================================================
     * ADMIN
     * =========================================================
     */

    List<ClientProduct> findAllByOrderByCreatedAtDesc();

    long countByStatus(
            ProductStatus status
    );
}