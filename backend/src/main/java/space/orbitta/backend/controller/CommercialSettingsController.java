package space.orbitta.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import space.orbitta.backend.dto.CommercialSettingsResponse;
import space.orbitta.backend.dto.UpdateCommercialSettingsRequest;
import space.orbitta.backend.service.CommercialSettingsService;

@RestController
public class CommercialSettingsController {

    private final CommercialSettingsService service;

    public CommercialSettingsController(
            CommercialSettingsService service
    ) {
        this.service = service;
    }

    @GetMapping("/api/commercial-settings")
    public ResponseEntity<CommercialSettingsResponse> getPublicSettings() {
        return ResponseEntity.ok(
                service.get()
        );
    }

    @GetMapping("/api/admin/commercial-settings")
    public ResponseEntity<CommercialSettingsResponse> getAdminSettings() {
        return ResponseEntity.ok(
                service.get()
        );
    }

    @PutMapping("/api/admin/commercial-settings")
    public ResponseEntity<CommercialSettingsResponse> update(
            @RequestBody UpdateCommercialSettingsRequest request
    ) {
        return ResponseEntity.ok(
                service.update(
                        request
                )
        );
    }
}
