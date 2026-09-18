package space.orbitta.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import space.orbitta.backend.entity.User;
import space.orbitta.backend.repository.UserRepository;

@Configuration
public class AdminBootstrapConfig {

    @Bean
    CommandLineRunner createInitialAdmin(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,

            @Value("${orbitta.admin.email:}")
            String adminEmail,

            @Value("${orbitta.admin.password:}")
            String adminPassword,

            @Value("${orbitta.admin.first-name:Orbitta}")
            String adminFirstName,

            @Value("${orbitta.admin.last-name:Admin}")
            String adminLastName
    ) {
        return args -> {

            if (adminEmail == null ||
                    adminEmail.isBlank() ||
                    adminPassword == null ||
                    adminPassword.isBlank()) {

                System.out.println(
                        "Orbitta Admin: credenciais iniciais não configuradas."
                );

                return;
            }

            String normalizedEmail =
                    adminEmail.trim().toLowerCase();

            if (userRepository.existsByEmailIgnoreCase(
                    normalizedEmail
            )) {
                System.out.println(
                        "Orbitta Admin: usuário já existente."
                );

                return;
            }

            User admin = new User();

            admin.setFirstName(
                    adminFirstName.trim()
            );

            admin.setLastName(
                    adminLastName.trim()
            );

            admin.setEmail(
                    normalizedEmail
            );

            admin.setPasswordHash(
                    passwordEncoder.encode(
                            adminPassword
                    )
            );

            admin.setPhone(null);

            admin.setRole(
                    User.Role.ADMIN
            );

            admin.setActive(true);

            userRepository.save(admin);

            System.out.println(
                    "Orbitta Admin: administrador inicial criado."
            );
        };
    }
}