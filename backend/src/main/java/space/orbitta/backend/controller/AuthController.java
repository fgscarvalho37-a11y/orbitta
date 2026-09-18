package space.orbitta.backend.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.*;
import space.orbitta.backend.dto.ChangePasswordRequest;
import space.orbitta.backend.dto.LoginRequest;
import space.orbitta.backend.dto.RegisterRequest;
import space.orbitta.backend.dto.RegisterResponse;
import space.orbitta.backend.dto.UpdateProfileRequest;
import space.orbitta.backend.entity.User;
import space.orbitta.backend.service.UserService;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final AuthenticationManager authenticationManager;

    public AuthController(
            UserService userService,
            AuthenticationManager authenticationManager
    ) {
        this.userService = userService;
        this.authenticationManager = authenticationManager;
    }

    /*
     * =========================================================
     * CADASTRO
     * =========================================================
     */

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @Valid @RequestBody RegisterRequest request
    ) {
        try {
            User user = userService.createClient(
                    request.firstName(),
                    request.lastName(),
                    request.email(),
                    request.password(),
                    request.phone()
            );

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(
                            RegisterResponse.from(user)
                    );

        } catch (IllegalArgumentException exception) {
            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    exception.getMessage()
                            )
                    );
        }
    }

    /*
     * =========================================================
     * LOGIN
     * =========================================================
     */

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest
    ) {
        try {
            Authentication authentication =
                    authenticationManager.authenticate(
                            new UsernamePasswordAuthenticationToken(
                                    request.email().trim(),
                                    request.password()
                            )
                    );

            SecurityContext securityContext =
                    SecurityContextHolder.createEmptyContext();

            securityContext.setAuthentication(
                    authentication
            );

            SecurityContextHolder.setContext(
                    securityContext
            );

            HttpSession oldSession =
                    httpRequest.getSession(false);

            if (oldSession != null) {
                oldSession.invalidate();
            }

            HttpSession session =
                    httpRequest.getSession(true);

            session.setAttribute(
                    HttpSessionSecurityContextRepository
                            .SPRING_SECURITY_CONTEXT_KEY,
                    securityContext
            );

            User user = userService.findByEmail(
                    authentication.getName()
            );

            return ResponseEntity.ok(
                    RegisterResponse.from(user)
            );

        } catch (BadCredentialsException exception) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(
                            Map.of(
                                    "message",
                                    "E-mail ou senha inválidos."
                            )
                    );

        } catch (DisabledException exception) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(
                            Map.of(
                                    "message",
                                    "Esta conta está desativada."
                            )
                    );
        }
    }

    /*
     * =========================================================
     * USUÁRIO AUTENTICADO
     * =========================================================
     */

    @GetMapping("/me")
    public ResponseEntity<?> me(
            Authentication authentication
    ) {
        if (
                authentication == null ||
                !authentication.isAuthenticated()
        ) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(
                            Map.of(
                                    "message",
                                    "Usuário não autenticado."
                            )
                    );
        }

        try {
            User user = userService.findByEmail(
                    authentication.getName()
            );

            return ResponseEntity.ok(
                    RegisterResponse.from(user)
            );

        } catch (IllegalArgumentException exception) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(
                            Map.of(
                                    "message",
                                    "Usuário não encontrado."
                            )
                    );
        }
    }

    /*
     * =========================================================
     * ATUALIZAR PERFIL
     * =========================================================
     */

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
            @RequestBody UpdateProfileRequest request,
            Authentication authentication
    ) {
        if (
                authentication == null ||
                !authentication.isAuthenticated()
        ) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(
                            Map.of(
                                    "message",
                                    "Usuário não autenticado."
                            )
                    );
        }

        try {
            User user = userService.updateProfile(
                    authentication.getName(),
                    request.firstName(),
                    request.lastName(),
                    request.phone()
            );

            return ResponseEntity.ok(
                    RegisterResponse.from(user)
            );

        } catch (IllegalArgumentException exception) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    exception.getMessage()
                            )
                    );
        }
    }

    /*
     * =========================================================
     * ALTERAR SENHA
     * =========================================================
     */

    @PutMapping("/password")
    public ResponseEntity<?> changePassword(
            @RequestBody ChangePasswordRequest request,
            Authentication authentication
    ) {
        if (
                authentication == null ||
                !authentication.isAuthenticated()
        ) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(
                            Map.of(
                                    "message",
                                    "Usuário não autenticado."
                            )
                    );
        }

        try {
            userService.changePassword(
                    authentication.getName(),
                    request.currentPassword(),
                    request.newPassword()
            );

            return ResponseEntity.ok(
                    Map.of(
                            "message",
                            "Senha alterada com sucesso."
                    )
            );

        } catch (IllegalArgumentException exception) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    exception.getMessage()
                            )
                    );
        }
    }

    /*
     * =========================================================
     * LOGOUT
     * =========================================================
     */

    @PostMapping("/logout")
    public ResponseEntity<?> logout(
            HttpServletRequest request
    ) {
        HttpSession session =
                request.getSession(false);

        if (session != null) {
            session.invalidate();
        }

        SecurityContextHolder.clearContext();

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "Logout realizado com sucesso."
                )
        );
    }
}