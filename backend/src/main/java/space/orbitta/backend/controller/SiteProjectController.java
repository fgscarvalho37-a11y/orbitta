package space.orbitta.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import space.orbitta.backend.dto.*;
import space.orbitta.backend.service.SiteProjectService;

import java.util.List;
import java.util.Map;

@RestController
public class SiteProjectController {
    private final SiteProjectService service;
    public SiteProjectController(SiteProjectService service) { this.service = service; }

    @GetMapping("/api/site-projects/by-checkout/{checkoutId}")
    public ResponseEntity<SiteProjectResponse> byCheckout(@PathVariable Long checkoutId, Authentication auth) {
        SiteProjectResponse found = service.findByCheckout(checkoutId, auth.getName());
        return found == null ? ResponseEntity.noContent().build() : ResponseEntity.ok(found);
    }

    @PostMapping("/api/site-projects")
    public ResponseEntity<SiteProjectResponse> submitBrief(@RequestBody SaveSiteProjectRequest req, Authentication auth) {
        return ResponseEntity.ok(service.submitBrief(req, auth.getName()));
    }

    @GetMapping("/api/site-projects")
    public ResponseEntity<List<SiteProjectResponse>> mine(Authentication auth) {
        return ResponseEntity.ok(service.myProjects(auth.getName()));
    }

    @GetMapping("/api/site-projects/{projectId}")
    public ResponseEntity<SiteProjectResponse> detail(@PathVariable Long projectId, Authentication auth) {
        return ResponseEntity.ok(service.detail(projectId, auth.getName()));
    }

    @GetMapping("/api/site-projects/{projectId}/messages")
    public ResponseEntity<List<SiteProjectMessageResponse>> messages(@PathVariable Long projectId, Authentication auth) {
        return ResponseEntity.ok(service.listMessages(projectId, auth.getName()));
    }

    @PostMapping("/api/site-projects/{projectId}/messages")
    public ResponseEntity<SiteProjectMessageResponse> message(
        @PathVariable Long projectId, @RequestBody SiteProjectMessageRequest req, Authentication auth
    ) {
        return ResponseEntity.ok(service.addMessage(projectId, req, auth.getName()));
    }

    @GetMapping("/api/admin/site-projects")
    public ResponseEntity<List<SiteProjectResponse>> all(Authentication auth) {
        return ResponseEntity.ok(service.allProjects(auth.getName()));
    }

    @PutMapping("/api/admin/site-projects/{projectId}/delivery")
    public ResponseEntity<SiteProjectResponse> deliver(
        @PathVariable Long projectId, @RequestBody SiteProjectDeliveryRequest req, Authentication auth
    ) {
        return ResponseEntity.ok(service.deliver(projectId, req, auth.getName()));
    }

    @PatchMapping("/api/admin/site-projects/{projectId}/status")
    public ResponseEntity<SiteProjectResponse> status(
        @PathVariable Long projectId, @RequestBody Map<String, String> req, Authentication auth
    ) {
        return ResponseEntity.ok(service.changeStatus(projectId, req.get("status"), auth.getName()));
    }
}
