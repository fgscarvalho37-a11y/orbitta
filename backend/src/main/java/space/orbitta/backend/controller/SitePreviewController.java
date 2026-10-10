package space.orbitta.backend.controller;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import space.orbitta.backend.service.SitePreviewService;
import java.util.List;
import java.util.Map;

@RestController
public class SitePreviewController {
    private final SitePreviewService previews;
    public SitePreviewController(SitePreviewService previews) { this.previews = previews; }

    @GetMapping("/api/admin/site-previews")
    public List<SitePreviewService.PreviewResult> list() {
        return previews.list();
    }

    @PostMapping(value = "/api/admin/site-previews", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public SitePreviewService.PreviewResult upload(
            @RequestParam String slug, @RequestParam String title,
            @RequestParam("file") MultipartFile file) {
        return previews.upload(slug, title, file);
    }

    @PatchMapping("/api/admin/site-previews/{id}/publish")
    public SitePreviewService.PreviewResult publish(
            @PathVariable Long id, @RequestBody Map<String, Boolean> request) {
        return previews.publish(id, Boolean.TRUE.equals(request.get("published")));
    }

    @GetMapping("/api/public/site-previews/{slug}")
    public SitePreviewService.PreviewResult publicPreview(@PathVariable String slug) {
        return previews.findPublic(slug);
    }
}
