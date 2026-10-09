package space.orbitta.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;
import space.orbitta.backend.dto.SubscriptionCheckoutResponse;
import space.orbitta.backend.service.CustomOfferService;

@RestController
public class StandaloneSiteCheckoutController {
    private final CustomOfferService offers;
    public StandaloneSiteCheckoutController(CustomOfferService offers) {
        this.offers = offers;
    }

    @PostMapping("/api/site-checkouts")
    public ResponseEntity<SubscriptionCheckoutResponse> create(Authentication authentication) {
        return ResponseEntity.ok(offers.createStandaloneSiteCheckout(authentication.getName()));
    }
}
