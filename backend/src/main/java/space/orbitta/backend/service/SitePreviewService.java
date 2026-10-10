package space.orbitta.backend.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import space.orbitta.backend.entity.SitePreview;
import space.orbitta.backend.repository.SitePreviewRepository;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.*;
import java.util.regex.Pattern;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

@Service
public class SitePreviewService {
    private static final Pattern SLUG = Pattern.compile("^[a-z0-9](?:[a-z0-9-]{0,78}[a-z0-9])?$");
    private static final Pattern ASSET = Pattern.compile("^assets/[a-zA-Z0-9._-]+\\.(?:png|jpe?g|webp)$");
    private static final long MAX_ARCHIVE = 4_000_000L;
    private static final int MAX_EXPANDED = 5_000_000;
    private final SitePreviewRepository repository;

    public SitePreviewService(SitePreviewRepository repository) { this.repository = repository; }

    public record PreviewResult(Long id, String slug, String title, boolean published,
                                LocalDateTime updatedAt, String html, String css, String javascript) {
        static PreviewResult from(SitePreview site, boolean includeSource) {
            return new PreviewResult(site.getId(), site.getSlug(), site.getTitle(),
                site.isPublished(), site.getUpdatedAt(),
                includeSource ? site.getHtml() : null,
                includeSource ? site.getCss() : null,
                includeSource ? site.getJavascript() : null);
        }
    }

    private static String normalizeSlug(String input) {
        String slug = input == null ? "" : input.trim().toLowerCase(Locale.ROOT);
        if (!SLUG.matcher(slug).matches()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Endereço inválido. Use apenas letras minúsculas, números e hífens.");
        }
        return slug;
    }

    private static Map<String, byte[]> extractZip(MultipartFile zipFile) {
        if (zipFile == null || zipFile.isEmpty() || zipFile.getSize() > MAX_ARCHIVE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Envie um ZIP válido de até 4 MB.");
        }
        Map<String, byte[]> result = new HashMap<>();
        int expanded = 0;
        try (InputStream stream = zipFile.getInputStream(); ZipInputStream input = new ZipInputStream(stream)) {
            ZipEntry entry;
            while ((entry = input.getNextEntry()) != null) {
                if (entry.isDirectory()) continue;
                String name = entry.getName().replace('\\', '/');
                if (name.startsWith("/") || name.contains("..") || name.contains("//")
                        || name.indexOf(':') >= 0 || result.containsKey(name) || result.size() >= 35) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "ZIP com nome de arquivo inválido, repetido ou arquivos demais.");
                }
                if (!name.equals("index.html") && !name.equals("style.css")
                        && !name.equals("app.js") && !ASSET.matcher(name).matches()) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Arquivo não aceito: " + name + ". Use index.html, style.css, app.js e assets/*.png/jpg/webp.");
                }
                ByteArrayOutputStream out = new ByteArrayOutputStream();
                byte[] buffer = new byte[8192];
                int size;
                while ((size = input.read(buffer)) != -1) {
                    expanded += size;
                    if (expanded > MAX_EXPANDED) {
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "ZIP descompactado muito grande.");
                    }
                    out.write(buffer, 0, size);
                }
                result.put(name, out.toByteArray());
                input.closeEntry();
            }
        } catch (ResponseStatusException error) {
            throw error;
        } catch (IOException error) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Não foi possível ler esse ZIP.");
        }
        if (!result.containsKey("index.html")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "O ZIP precisa conter index.html na raiz.");
        }
        return result;
    }

    private static String decoded(byte[] bytes, int max, String name) {
        if (bytes.length > max) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Arquivo grande demais: " + name);
        }
        return new String(bytes, StandardCharsets.UTF_8);
    }

    @Transactional
    public PreviewResult upload(String rawSlug, String rawTitle, MultipartFile file) {
        String slug = normalizeSlug(rawSlug);
        String title = rawTitle == null ? "" : rawTitle.trim();
        if (title.isBlank() || title.length() > 140) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Informe um nome para a apresentação (até 140 caracteres).");
        }
        Map<String, byte[]> files = extractZip(file);
        String html = decoded(files.get("index.html"), 350_000, "index.html");
        String css = decoded(files.getOrDefault("style.css", new byte[0]), 350_000, "style.css");
        String js = decoded(files.getOrDefault("app.js", new byte[0]), 350_000, "app.js");

        // Inline image assets, preserving stable public URLs across revisions.
        // Files run only inside a sandboxed, opaque-origin iframe.
        for (Map.Entry<String, byte[]> item : files.entrySet()) {
            String name = item.getKey();
            if (!name.startsWith("assets/")) continue;
            String ext = name.substring(name.lastIndexOf('.') + 1).toLowerCase(Locale.ROOT);
            String mime = ext.equals("png") ? "image/png" :
                    ext.equals("webp") ? "image/webp" : "image/jpeg";
            String data = "data:" + mime + ";base64," + Base64.getEncoder().encodeToString(item.getValue());
            for (String ref : List.of(name, "./" + name, "/" + name)) {
                html = html.replace("\"" + ref + "\"", "\"" + data + "\"");
                html = html.replace("'" + ref + "'", "'" + data + "'");
                css = css.replace("url(" + ref + ")", "url(" + data + ")");
                css = css.replace("url('" + ref + "')", "url('" + data + "')");
                css = css.replace("url(\"" + ref + "\")", "url(\"" + data + "\")");
                js = js.replace("\"" + ref + "\"", "\"" + data + "\"");
                js = js.replace("'" + ref + "'", "'" + data + "'");
            }
        }
        if (html.length() + css.length() + js.length() > 7_500_000) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Prévia excede o limite de 7,5 MB.");
        }
        SitePreview site = repository.findBySlug(slug).orElseGet(SitePreview::new);
        boolean isNew = site.getId() == null;
        site.setSlug(slug);
        site.setTitle(title);
        site.setHtml(html);
        site.setCss(css);
        site.setJavascript(js);
        if (isNew) site.setPublished(true);
        // Existing preview keeps its public/private status when ZIP is replaced.
        return PreviewResult.from(repository.saveAndFlush(site), false);
    }

    @Transactional(readOnly = true)
    public List<PreviewResult> list() {
        return repository.findAllByOrderByUpdatedAtDesc().stream()
                .map(site -> PreviewResult.from(site, false)).toList();
    }

    @Transactional(readOnly = true)
    public PreviewResult findPublic(String rawSlug) {
        return PreviewResult.from(repository.findBySlug(normalizeSlug(rawSlug))
                .filter(SitePreview::isPublished)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Prévia indisponível.")), true);
    }

    @Transactional
    public PreviewResult publish(Long id, boolean published) {
        SitePreview site = repository.findById(id).orElseThrow(() ->
            new ResponseStatusException(HttpStatus.NOT_FOUND, "Prévia não encontrada."));
        site.setPublished(published);
        return PreviewResult.from(repository.saveAndFlush(site), false);
    }
}
