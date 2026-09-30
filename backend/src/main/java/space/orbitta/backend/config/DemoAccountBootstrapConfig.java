package space.orbitta.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import space.orbitta.backend.entity.User;
import space.orbitta.backend.repository.UserRepository;
import space.orbitta.backend.service.PizzaSystemProvisionService;

@Configuration
public class DemoAccountBootstrapConfig {

    @Value("${ORBITTA_DEMO_ACCOUNT_EMAIL:demo@orbitta.space}")
    private String demoEmail;

    @Value("${ORBITTA_DEMO_ACCOUNT_PASSWORD:}")
    private String demoPassword;

    @Bean
    CommandLineRunner bootstrapDemoAccount(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            PizzaSystemProvisionService pizzaSystemProvisionService
    ) {
        return args -> {
            if (
                    demoPassword == null ||
                    demoPassword.isBlank()
            ) {
                return;
            }

            String normalizedEmail =
                    demoEmail == null
                            ? "demo@orbitta.space"
                            : demoEmail.trim().toLowerCase();

            User demo =
                    userRepository
                            .findByEmailIgnoreCase(
                                    normalizedEmail
                            )
                            .orElse(
                                    null
                            );

            if (demo == null) {
                System.err.println(
                        "[DEMO] Conta demo não encontrada: "
                                + normalizedEmail
                );
                return;
            }

            final Long demoId =
                    demo.getId();

            userRepository
                    .findFirstByRoleAndDemoAccountTrue(
                            User.Role.CLIENT
                    )
                    .ifPresent(
                            current -> {
                                if (
                                        !current.getId()
                                                .equals(
                                                        demoId
                                                )
                                ) {
                                    current.setDemoAccount(
                                            false
                                    );

                                    userRepository.save(
                                            current
                                    );
                                }
                            }
                    );

            demo.setActive(
                    true
            );

            demo.setDemoAccount(
                    true
            );

            demo.setPasswordHash(
                    passwordEncoder.encode(
                            demoPassword
                    )
            );

            User savedDemo =
                    userRepository.save(
                            demo
                    );

            try {
                pizzaSystemProvisionService
                        .syncUser(
                                savedDemo
                        );

                System.out.println(
                        "[DEMO] Credencial da conta demo sincronizada com o PizzaSystem."
                );

            } catch (RuntimeException exception) {
                System.err.println(
                        "[DEMO] Falha ao sincronizar conta demo com o PizzaSystem: "
                                + exception.getMessage()
                );
            }
        };
    }
}
