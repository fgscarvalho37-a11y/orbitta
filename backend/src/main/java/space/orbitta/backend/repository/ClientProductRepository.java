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
     * Verifica se o cliente já possui este plano
     * do catálogo com determinado status.
     *
     * Usaremos isso no fluxo de contratação para impedir
     * a criação acidental de uma segunda assinatura ativa
     * do mesmo plano.
     */
    boolean existsByUserIdAndCatalogPlanIdAndStatus(
            Long userId,
            Long catalogPlanId,
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