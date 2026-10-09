package space.orbitta.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import java.util.Map;
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
    public ResponseEntity<SubscriptionCheckoutResponse> create(Authentication authentication,
            @RequestBody(required = false) Map<String,String> request) {
        return ResponseEntity.ok(offers.createStandaloneSiteCheckout(authentication.getName(), request == null ? null : request.get("market")));
    }

    @PostMapping("/api/bundle-checkouts")
    public ResponseEntity<SubscriptionCheckoutResponse> createBundle(Authentication authentication,
            @RequestBody(required = false) Map<String,String> request) {
        return ResponseEntity.ok(offers.createBundleCheckout(authentication.getName(), request == null ? null : request.get("market")));
    }
}
