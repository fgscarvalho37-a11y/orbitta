package space.orbitta.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import space.orbitta.backend.entity.CustomStorefront;
import space.orbitta.backend.repository.CustomStorefrontRepository;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.net.URI;
import java.net.http.*;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.*;
import java.util.regex.*;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

@Service
public class CustomStorefrontService {
    private static final Pattern SLUG = Pattern.compile("^[a-z0-9](?:[a-z0-9-]{0,78}[a-z0-9])?$");
    private static final int MAX_ARCHIVE = 4_000_000;
    private static final int MAX_UNZIPPED = 5_000_000;
    private final CustomStorefrontRepository repository;
    private final HttpClient client = HttpClient.newBuilder()
        .connectTimeout(Duration.ofSeconds(4)).followRedirects(HttpClient.Redirect.NEVER).build();

    @Value("${pizzasystem.api-url:https://pizzasystem-api.onrender.com}")
    private String pizzaSystemApiUrl;

    public CustomStorefrontService(CustomStorefrontRepository repository) {
        this.repository=repository;
    }

    public record StorefrontResponse(Long id, String siteSlug, String storeSlug, String displayName,
                                     boolean published, String html, String css, String javascript) {
        static StorefrontResponse from(CustomStorefront site, boolean includeSources) {
            return new StorefrontResponse(site.getId(),site.getSiteSlug(),site.getStoreSlug(),
                site.getDisplayName(),site.isPublished(),
                includeSources ? site.getHtml() : null,
                includeSources ? site.getCss() : null,
                includeSources ? site.getJavascript() : null);
        }
    }

    private static String slug(String value) {
        String normalized = value==null ? "" : value.trim().toLowerCase(Locale.ROOT);
        if (!SLUG.matcher(normalized).matches()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Identificador inválido. Use letras minúsculas, números e hífens (máximo 80).");
        }
        return normalized;
    }

    private void verifyStore(String storeSlug) {
        try {
            String base=pizzaSystemApiUrl.replaceAll("/+$","");
            URI target=URI.create(base+"/api/store/profile?store="+storeSlug);
            if (!"https".equalsIgnoreCase(target.getScheme()) && !"http".equalsIgnoreCase(target.getScheme())) {
                throw new IllegalStateException("PizzaSystem URL is invalid");
            }
            HttpResponse<Void> response=client.send(HttpRequest.newBuilder(target)
                    .timeout(Duration.ofSeconds(9)).GET().build(),
                HttpResponse.BodyHandlers.discarding());
            if (response.statusCode()!=200) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Loja não encontrada no PizzaSystem: "+storeSlug);
            }
        } catch (ResponseStatusException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                "Não foi possível verificar a pizzaria no PizzaSystem. Tente novamente.");
        }
    }

    private static String boundedText(byte[] bytes, int max, String fileName) {
        if (bytes.length>max) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Arquivo muito grande: "+fileName);
        return new String(bytes, StandardCharsets.UTF_8);
    }

    private static Map<String,byte[]> unzip(MultipartFile file) {
        if (file==null || file.isEmpty() || file.getSize()>MAX_ARCHIVE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Envie um arquivo ZIP com até 4 MB.");
        }
        Map<String,byte[]> files=new HashMap<>();
        int total=0;
        try (InputStream in=file.getInputStream(); ZipInputStream zip=new ZipInputStream(in)) {
            ZipEntry entry;
            while ((entry=zip.getNextEntry())!=null) {
                if (entry.isDirectory()) continue;
                String name=entry.getName().replace('\\','/');
                if (name.startsWith("/")||name.contains("..")||name.contains("//") ||
                    name.indexOf(':')>=0 || files.containsKey(name) || files.size()>=48) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Nome de arquivo inválido ou ZIP com arquivos demais.");
                }
                if (!(name.equals("index.html") || name.equals("style.css") ||
                      name.equals("app.js") || name.matches("assets/[a-zA-Z0-9._-]+\\.(png|jpg|jpeg|webp)"))) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Arquivo não permitido no ZIP: "+name+
                        ". Use index.html, style.css, app.js e assets/*.png/jpg/webp.");
                }
                ByteArrayOutputStream out=new ByteArrayOutputStream();
                byte[] buf=new byte[8192]; int n;
                while ((n=zip.read(buf))!=-1) {
                    total+=n;
                    if (total>MAX_UNZIPPED) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "ZIP descompactado excede 5 MB.");
                    out.write(buf,0,n);
                }
                files.put(name,out.toByteArray());
            }
        } catch (ResponseStatusException ex) { throw ex; }
        catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Arquivo ZIP inválido ou corrompido.");
        }
        if (!files.containsKey("index.html") || !files.containsKey("app.js")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "O ZIP precisa conter index.html e app.js na raiz.");
        }
        return files;
    }

    @Transactional
    public StorefrontResponse importZip(String siteSlug, String storeSlug, String displayName,
                                         MultipartFile file, boolean published) {
        String site=slug(siteSlug), store=slug(storeSlug);
        if (displayName==null || displayName.isBlank() || displayName.length()>120)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Informe o nome da pizzaria.");
        verifyStore(store);
        Map<String,byte[]> zip=unzip(file);
        String html=boundedText(zip.get("index.html"),250_000,"index.html");
        String css=boundedText(zip.getOrDefault("style.css",new byte[0]),220_000,"style.css");
        String js=boundedText(zip.get("app.js"),230_000,"app.js");
        // The template runs in a sandboxed, opaque-origin iframe. No HTML,
        // JS or uploaded asset executes in the Orbitta admin's origin.
        for (Map.Entry<String,byte[]> asset:zip.entrySet()) {
            String fileName=asset.getKey();
            if (!fileName.startsWith("assets/")) continue;
            String extension=fileName.substring(fileName.lastIndexOf('.')+1).toLowerCase(Locale.ROOT);
            String mime=extension.equals("png")?"image/png":
                extension.equals("webp")?"image/webp":"image/jpeg";
            String dataUrl="data:"+mime+";base64,"+Base64.getEncoder().encodeToString(asset.getValue());
            for (String prefix:List.of(fileName,"./"+fileName,"/"+fileName)) {
                html=html.replace("\""+prefix+"\"","\""+dataUrl+"\"");
                html=html.replace("'"+prefix+"'","'"+dataUrl+"'");
                css=css.replace("url("+prefix+")","url("+dataUrl+")");
                css=css.replace("url('"+prefix+"')","url('"+dataUrl+"')");
                css=css.replace("url(\""+prefix+"\")","url(\""+dataUrl+"\")");
            }
        }
        // CSS/HTML assets are stored as data URIs; overall DB payload remains bounded.
        if (html.length()+css.length()+js.length()>7_500_000) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Template excede o limite de tamanho.");
        }
        CustomStorefront entity=repository.findBySiteSlug(site).orElseGet(CustomStorefront::new);
        entity.setSiteSlug(site); entity.setStoreSlug(store);
        entity.setDisplayName(displayName.trim()); entity.setHtml(html);
        entity.setCss(css);entity.setJavascript(js);entity.setPublished(published);
        return StorefrontResponse.from(repository.save(entity),false);
    }

    @Transactional(readOnly=true)
    public List<StorefrontResponse> all() {
        return repository.findAllByOrderByUpdatedAtDesc().stream()
            .map(s->StorefrontResponse.from(s,false)).toList();
    }
    @Transactional(readOnly=true)
    public StorefrontResponse bySlug(String slug) {
        return StorefrontResponse.from(repository.findBySiteSlug(slug(slug))
            .filter(CustomStorefront::isPublished)
            .orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Site não publicado.")),true);
    }
    @Transactional
    public StorefrontResponse toggle(Long id, boolean published) {
        CustomStorefront site=repository.findById(id)
            .orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND));
        site.setPublished(published);
        return StorefrontResponse.from(repository.save(site),false);
    }
}
