package space.orbitta.backend.controller;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import space.orbitta.backend.dto.CreateSupportTicketRequest;
import space.orbitta.backend.dto.SupportTicketResponse;
import space.orbitta.backend.service.SupportTicketService;

import java.util.List;

@RestController
public class SupportTicketController {

    private final SupportTicketService service;

    public SupportTicketController(
            SupportTicketService service
    ) {
        this.service = service;
    }

    @GetMapping(
            "/api/support/tickets"
    )
    public ResponseEntity<List<SupportTicketResponse>> findMyTickets(
            Authentication authentication
    ) {

        return ResponseEntity.ok(
                service.findForUser(
                        authentication.getName()
                )
        );
    }

    @PostMapping(
            "/api/support/tickets"
    )
    public ResponseEntity<SupportTicketResponse> createTicket(
            @Valid
            @RequestBody
            CreateSupportTicketRequest request,
            Authentication authentication
    ) {

        return ResponseEntity
                .status(
                        HttpStatus.CREATED
                )
                .body(
                        service.create(
                                authentication.getName(),
                                request
                        )
                );
    }

    @GetMapping(
            "/api/admin/support/tickets"
    )
    public ResponseEntity<List<SupportTicketResponse>> findAllForAdmin() {

        return ResponseEntity.ok(
                service.findAllForAdmin()
        );
    }
}
