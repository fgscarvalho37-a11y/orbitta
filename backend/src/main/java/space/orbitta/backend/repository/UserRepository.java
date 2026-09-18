package space.orbitta.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import space.orbitta.backend.entity.User;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmailIgnoreCase(
            String email
    );

    boolean existsByEmailIgnoreCase(
            String email
    );

    /*
     * =========================================================
     * ADMIN - CLIENTES
     * =========================================================
     */

    List<User> findByRoleOrderByCreatedAtDesc(
            User.Role role
    );

    Optional<User> findByIdAndRole(
            Long id,
            User.Role role
    );

    long countByRole(
            User.Role role
    );

    long countByRoleAndActiveTrue(
            User.Role role
    );
}