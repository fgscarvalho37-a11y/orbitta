package space.orbitta.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import space.orbitta.backend.entity.SubscriptionCheckout;
import space.orbitta.backend.entity.SubscriptionCheckoutStatus;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface SubscriptionCheckoutRepository
        extends JpaRepository<SubscriptionCheckout, Long> {

    Optional<SubscriptionCheckout> findByIdAndUserId(
            Long id,
            Long userId
    );

    Optional<SubscriptionCheckout> findByExternalReference(
            String externalReference
    );

    Optional<SubscriptionCheckout>
    findFirstByPaymentProviderAndExternalPaymentIdOrderByCreatedAtDesc(
            String paymentProvider,
            String externalPaymentId
    );

    List<SubscriptionCheckout> findByUserIdOrderByCreatedAtDesc(
            Long userId
    );

    Optional<SubscriptionCheckout>
    findFirstByUserIdAndCatalogPlanIdAndStatusInOrderByCreatedAtDesc(
            Long userId,
            Long catalogPlanId,
            Collection<SubscriptionCheckoutStatus> statuses
    );

    Optional<SubscriptionCheckout>
    findFirstByUserIdAndStatusInOrderByCreatedAtDesc(
            Long userId,
            Collection<SubscriptionCheckoutStatus> statuses
    );
}