package space.orbitta.backend.controller;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import space.orbitta.backend.service.CustomStorefrontService;
import java.util.List;
import java.util.Map;

@RestController
public class CustomStorefrontController {
    private final CustomStorefrontService sites;
    public CustomStorefrontController(CustomStorefrontService sites){this.sites=sites;}

    @PostMapping(value="/api/admin/custom-storefronts",consumes=MediaType.MULTIPART_FORM_DATA_VALUE)
    public CustomStorefrontService.StorefrontResponse upload(
        @RequestParam String siteSlug,@RequestParam String storeSlug,
        @RequestParam String displayName,@RequestParam(defaultValue="false") boolean published,
        @RequestParam("file") MultipartFile file) {
        return sites.importZip(siteSlug,storeSlug,displayName,file,published);
    }
    @GetMapping("/api/admin/custom-storefronts")
    public List<CustomStorefrontService.StorefrontResponse> all(){return sites.all();}

    @PatchMapping("/api/admin/custom-storefronts/{id}/publish")
    public CustomStorefrontService.StorefrontResponse toggle(@PathVariable Long id,
                                                    @RequestBody Map<String,Boolean> request){
        return sites.toggle(id,Boolean.TRUE.equals(request.get("published")));
    }
    @GetMapping("/api/public/custom-storefronts/{slug}")
    public CustomStorefrontService.StorefrontResponse storefront(@PathVariable String slug){
        return sites.bySlug(slug);
    }
}
