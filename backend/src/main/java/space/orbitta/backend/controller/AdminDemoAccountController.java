package space.orbitta.backend.controller;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import space.orbitta.backend.dto.DemoAccountResponse;
import space.orbitta.backend.dto.SelectDemoAccountRequest;
import space.orbitta.backend.dto.UpdateClientStatusRequest;
import space.orbitta.backend.service.DemoAccountService;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/demo-account")
public class AdminDemoAccountController {

    private final DemoAccountService
            demoAccountService;

    public AdminDemoAccountController(
            DemoAccountService demoAccountService
    ) {
        this.demoAccountService =
                demoAccountService;
    }

    @GetMapping
    public ResponseEntity<?> getCurrent() {

        DemoAccountResponse response =
                demoAccountService
                        .getCurrent();

        if (response == null) {
            return ResponseEntity.ok(
                    Map.of(
                            "configured",
                            false
                    )
            );
        }

        return ResponseEntity.ok(
                response
        );
    }

    @PutMapping
    public ResponseEntity<DemoAccountResponse> select(
            @Valid
            @RequestBody
            SelectDemoAccountRequest request
    ) {

        return ResponseEntity.ok(
                demoAccountService
                        .select(
                                request.userId()
                        )
        );
    }

    @PatchMapping("/status")
    public ResponseEntity<DemoAccountResponse> updateStatus(
            @Valid
            @RequestBody
            UpdateClientStatusRequest request
    ) {

        return ResponseEntity.ok(
                demoAccountService
                        .updateStatus(
                                request.active()
                        )
        );
    }
}
