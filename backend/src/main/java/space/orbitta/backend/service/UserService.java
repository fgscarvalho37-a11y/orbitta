package space.orbitta.backend.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import space.orbitta.backend.dto.RegisterResponse;
import space.orbitta.backend.entity.User;
import space.orbitta.backend.repository.UserRepository;

import java.util.List;
import java.util.Locale;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final PizzaSystemProvisionService
            pizzaSystemProvisionService;

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            PizzaSystemProvisionService pizzaSystemProvisionService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.pizzaSystemProvisionService =
                pizzaSystemProvisionService;
    }

    /*
     * =========================================================
     * CADASTRO
     * =========================================================
     */

    @Transactional
    public User createClient(
            String firstName,
            String lastName,
            String email,
            String password,
            String phone
    ) {
        String normalizedFirstName =
                normalizeRequired(firstName, "Nome");

        String normalizedLastName =
                normalizeRequired(lastName, "Sobrenome");

        String normalizedEmail =
                normalizeEmail(email);

        validatePassword(password);

        if (
                userRepository.existsByEmailIgnoreCase(
                        normalizedEmail
                )
        ) {
            throw new IllegalArgumentException(
                    "Já existe uma conta cadastrada com este e-mail."
            );
        }

        User user = new User();

        user.setFirstName(normalizedFirstName);
        user.setLastName(normalizedLastName);
        user.setEmail(normalizedEmail);
        user.setPasswordHash(
                passwordEncoder.encode(password)
        );
        user.setPhone(
                normalizeOptional(phone)
        );
        user.setRole(User.Role.CLIENT);
        user.setActive(true);

        return userRepository.save(user);
    }

    /*
     * =========================================================
     * CONSULTAS
     * =========================================================
     */

    @Transactional(readOnly = true)
    public User findByEmail(
            String email
    ) {
        String normalizedEmail =
                normalizeEmail(email);

        return userRepository
                .findByEmailIgnoreCase(
                        normalizedEmail
                )
                .orElseThrow(
                        () -> new IllegalArgumentException(
                                "Usuário não encontrado."
                        )
                );
    }

    @Transactional(readOnly = true)
    public User findById(
            Long id
    ) {
        if (id == null) {
            throw new IllegalArgumentException(
                    "ID do usuário é obrigatório."
            );
        }

        return userRepository
                .findById(id)
                .orElseThrow(
                        () -> new IllegalArgumentException(
                                "Usuário não encontrado."
                        )
                );
    }

    /*
     * =========================================================
     * ADMIN - CLIENTES
     * =========================================================
     */

    @Transactional(readOnly = true)
    public List<RegisterResponse> findAllClients() {
        return userRepository
                .findByRoleOrderByCreatedAtDesc(
                        User.Role.CLIENT
                )
                .stream()
                .map(RegisterResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public RegisterResponse findClientById(
            Long id
    ) {
        User user = findClientEntityById(id);

        return RegisterResponse.from(user);
    }

    @Transactional
    public RegisterResponse updateClientStatus(
            Long id,
            boolean active
    ) {
        User user = findClientEntityById(id);

        if (user.isActive() == active) {
            return RegisterResponse.from(user);
        }

        user.setActive(active);

        User savedUser =
                userRepository.save(user);

        return RegisterResponse.from(savedUser);
    }

    @Transactional(readOnly = true)
    public long countClients() {
        return userRepository.countByRole(
                User.Role.CLIENT
        );
    }

    @Transactional(readOnly = true)
    public long countActiveClients() {
        return userRepository
                .countByRoleAndActiveTrue(
                        User.Role.CLIENT
                );
    }

    /*
     * =========================================================
     * PERFIL
     * =========================================================
     */

    @Transactional
    public User updateProfile(
            String email,
            String firstName,
            String lastName,
            String phone
    ) {
        User user = findByEmail(email);

        user.setFirstName(
                normalizeRequired(
                        firstName,
                        "Nome"
                )
        );

        user.setLastName(
                normalizeRequired(
                        lastName,
                        "Sobrenome"
                )
        );

        user.setPhone(
                normalizeOptional(phone)
        );

        return userRepository.save(user);
    }

    /*
     * =========================================================
     * SENHA
     * =========================================================
     */

    @Transactional
    public void changePassword(
            String email,
            String currentPassword,
            String newPassword
    ) {
        User user = findByEmail(email);

        if (
                currentPassword == null ||
                currentPassword.isBlank()
        ) {
            throw new IllegalArgumentException(
                    "A senha atual é obrigatória."
            );
        }

        if (
                !passwordEncoder.matches(
                        currentPassword,
                        user.getPasswordHash()
                )
        ) {
            throw new IllegalArgumentException(
                    "A senha atual está incorreta."
            );
        }

        validatePassword(newPassword);

        if (
                passwordEncoder.matches(
                        newPassword,
                        user.getPasswordHash()
                )
        ) {
            throw new IllegalArgumentException(
                    "A nova senha deve ser diferente da senha atual."
            );
        }

        user.setPasswordHash(
                passwordEncoder.encode(
                        newPassword
                )
        );

        user =
                userRepository.save(
                        user
                );

        /*
         * Mantém a credencial administrativa do PizzaSystem
         * sincronizada com a conta Orbitta.
         */
        pizzaSystemProvisionService
                .syncUser(
                        user
                );
    }

    /*
     * =========================================================
     * AUXILIARES
     * =========================================================
     */

    private User findClientEntityById(
            Long id
    ) {
        if (id == null) {
            throw new IllegalArgumentException(
                    "ID do cliente é obrigatório."
            );
        }

        return userRepository
                .findByIdAndRole(
                        id,
                        User.Role.CLIENT
                )
                .orElseThrow(
                        () -> new IllegalArgumentException(
                                "Cliente não encontrado."
                        )
                );
    }

    private String normalizeEmail(
            String email
    ) {
        if (
                email == null ||
                email.isBlank()
        ) {
            throw new IllegalArgumentException(
                    "E-mail é obrigatório."
            );
        }

        String normalized =
                email
                        .trim()
                        .toLowerCase(
                                Locale.ROOT
                        );

        if (!normalized.contains("@")) {
            throw new IllegalArgumentException(
                    "E-mail inválido."
            );
        }

        return normalized;
    }

    private String normalizeRequired(
            String value,
            String fieldName
    ) {
        if (
                value == null ||
                value.isBlank()
        ) {
            throw new IllegalArgumentException(
                    fieldName +
                            " é obrigatório."
            );
        }

        return value.trim();
    }

    private String normalizeOptional(
            String value
    ) {
        if (
                value == null ||
                value.isBlank()
        ) {
            return null;
        }

        return value.trim();
    }

    private void validatePassword(
            String password
    ) {
        if (
                password == null ||
                password.isBlank()
        ) {
            throw new IllegalArgumentException(
                    "Senha é obrigatória."
            );
        }

        if (password.length() < 8) {
            throw new IllegalArgumentException(
                    "A senha deve possuir pelo menos 8 caracteres."
            );
        }

        if (password.length() > 72) {
            throw new IllegalArgumentException(
                    "A senha deve possuir no máximo 72 caracteres."
            );
        }
    }
}