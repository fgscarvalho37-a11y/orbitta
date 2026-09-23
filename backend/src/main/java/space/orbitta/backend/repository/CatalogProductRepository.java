package space.orbitta.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import space.orbitta.backend.entity.CatalogProduct;

import java.util.List;
import java.util.Optional;

public interface CatalogProductRepository
        extends JpaRepository<CatalogProduct, Long> {

    List<CatalogProduct> findAllByOrderByDisplayOrderAscNameAsc();

    List<CatalogProduct> findByActiveTrueOrderByDisplayOrderAscNameAsc();

    Optional<CatalogProduct> findBySlug(String slug);

    boolean existsBySlug(String slug);
}