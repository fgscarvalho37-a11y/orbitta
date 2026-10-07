package space.orbitta.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import space.orbitta.backend.entity.CustomOffer;

import java.util.List;
import java.util.Optional;

public interface CustomOfferRepository
        extends JpaRepository<CustomOffer, Long> {

    Optional<CustomOffer> findByToken(
            String token
    );

    List<CustomOffer> findAllByOrderByCreatedAtDesc();
}
