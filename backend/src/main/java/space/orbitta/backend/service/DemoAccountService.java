package space.orbitta.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import space.orbitta.backend.dto.DemoAccountResponse;
import space.orbitta.backend.entity.DemoAccessLog;
import space.orbitta.backend.entity.User;
import space.orbitta.backend.repository.DemoAccessLogRepository;
import space.orbitta.backend.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class DemoAccountService {

    private final UserRepository
            userRepository;

    private final DemoAccessLogRepository
            demoAccessLogRepository;

    public DemoAccountService(
            UserRepository userRepository,
            DemoAccessLogRepository demoAccessLogRepository
    ) {
        this.userRepository =
                userRepository;

        this.demoAccessLogRepository =
                demoAccessLogRepository;
    }

    @Transactional(readOnly = true)
    public DemoAccountResponse getCurrent() {

        User user =
                userRepository
                        .findFirstByRoleAndDemoAccountTrue(
                                User.Role.CLIENT
                        )
                        .orElse(
                                null
                        );

        return user == null
                ? null
                : toResponse(
                        user
                );
    }

    @Transactional
    public DemoAccountResponse select(
            Long userId
    ) {

        if (userId == null) {
            throw new IllegalArgumentException(
                    "Selecione uma conta de cliente."
            );
        }

        User selected =
                userRepository
                        .findByIdAndRole(
                                userId,
                                User.Role.CLIENT
                        )
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Cliente não encontrado."
                                        )
                        );

        Long selectedId =
                selected.getId();

        userRepository
                .findFirstByRoleAndDemoAccountTrue(
                        User.Role.CLIENT
                )
                .ifPresent(
                        current -> {
                            if (
                                    !current.getId()
                                            .equals(
                                                    selectedId
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

        if (
                !selected.isDemoAccount()
        ) {
            selected.setDemoAccount(
                    true
            );

            selected =
                    userRepository.save(
                            selected
                    );
        }

        return toResponse(
                selected
        );
    }

    @Transactional
    public DemoAccountResponse updateStatus(
            boolean active
    ) {

        User user =
                userRepository
                        .findFirstByRoleAndDemoAccountTrue(
                                User.Role.CLIENT
                        )
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Nenhuma conta de demonstração foi selecionada."
                                        )
                        );

        if (
                user.isActive() != active
        ) {
            user.setActive(
                    active
            );

            user =
                    userRepository.save(
                            user
                    );
        }

        return toResponse(
                user
        );
    }

    @Transactional
    public void recordSuccessfulLogin(
            User user
    ) {

        if (
                user == null ||
                user.getRole() !=
                        User.Role.CLIENT ||
                !user.isDemoAccount()
        ) {
            return;
        }

        DemoAccessLog log =
                new DemoAccessLog();

        log.setUser(
                user
        );

        demoAccessLogRepository.save(
                log
        );
    }

    private DemoAccountResponse toResponse(
            User user
    ) {

        List<LocalDateTime> recentAccesses =
                demoAccessLogRepository
                        .findTop10ByUserIdOrderByAccessedAtDesc(
                                user.getId()
                        )
                        .stream()
                        .map(
                                DemoAccessLog::getAccessedAt
                        )
                        .toList();

        LocalDateTime lastAccessAt =
                recentAccesses.isEmpty()
                        ? null
                        : recentAccesses.get(
                                0
                        );

        long totalAccesses =
                demoAccessLogRepository
                        .countByUserId(
                                user.getId()
                        );

        return new DemoAccountResponse(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.isActive(),
                totalAccesses,
                lastAccessAt,
                recentAccesses
        );
    }
}
