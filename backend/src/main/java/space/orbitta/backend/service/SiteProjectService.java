package space.orbitta.backend.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import space.orbitta.backend.dto.*;
import space.orbitta.backend.entity.*;
import space.orbitta.backend.repository.*;

import java.net.URI;
import java.util.List;
import java.util.Locale;

@Service
public class SiteProjectService {
    private static final String SITE_PRODUCT_SLUG = "custom-site-service";
    private final SiteProjectRepository projects;
    private final SiteProjectMessageRepository messages;
    private final SubscriptionCheckoutRepository checkouts;
    private final UserRepository users;

    public SiteProjectService(
        SiteProjectRepository projects,
        SiteProjectMessageRepository messages,
        SubscriptionCheckoutRepository checkouts,
        UserRepository users
    ) {
        this.projects = projects;
        this.messages = messages;
        this.checkouts = checkouts;
        this.users = users;
    }

    private User current(String email) {
        if (email == null || email.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
        return users.findByEmailIgnoreCase(email.trim().toLowerCase(Locale.ROOT))
            .filter(User::isActive)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
    }

    private SubscriptionCheckout paidWebsite(Long checkoutId, User client) {
        if (checkoutId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Checkout obrigatório.");
        }
        SubscriptionCheckout checkout = checkouts.findByIdAndUserId(checkoutId, client.getId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Compra não encontrada."));
        if (checkout.getCatalogProduct() == null
            || !SITE_PRODUCT_SLUG.equals(checkout.getCatalogProduct().getSlug())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Este checkout não é de um site avulso.");
        }
        if (checkout.getStatus() != SubscriptionCheckoutStatus.APPROVED) {
            throw new ResponseStatusException(HttpStatus.PAYMENT_REQUIRED, "O formulário só abre após o pagamento ser aprovado.");
        }
        return checkout;
    }

    private SiteProject allowedProject(Long id, User current) {
        SiteProject project = projects.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (current.getRole() != User.Role.ADMIN
                && !project.getUser().getId().equals(current.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
        return project;
    }

    private void requireAdmin(User actor) {
        if (actor.getRole() != User.Role.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
    }

    private String required(String value, int max, String field) {
        if (value == null || value.isBlank() || value.trim().length() > max) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, field + " obrigatório (máximo de " + max + " caracteres).");
        }
        return value.trim();
    }

    private String optional(String value, int max) {
        if (value == null || value.isBlank()) return null;
        if (value.trim().length() > max) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Campo longo demais.");
        return value.trim();
    }

    @Transactional(readOnly = true)
    public SiteProjectResponse findByCheckout(Long checkoutId, String email) {
        User client = current(email);
        paidWebsite(checkoutId, client);
        return projects.findByCheckoutId(checkoutId)
            .map(SiteProjectResponse::from)
            .orElse(null);
    }

    @Transactional
    public SiteProjectResponse submitBrief(SaveSiteProjectRequest req, String email) {
        if (req == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
        User client = current(email);
        SubscriptionCheckout checkout = paidWebsite(req.checkoutId(), client);
        SiteProject project = projects.findByCheckoutId(checkout.getId()).orElseGet(SiteProject::new);
        if (project.getId() == null) {
            project.setCheckout(checkout);
            project.setUser(client);
        }
        project.setBusinessName(required(req.businessName(), 140, "Nome da empresa"));
        project.setContactEmail(required(req.contactEmail(), 255, "Email de contato"));
        project.setContactPhone(optional(req.contactPhone(), 40));
        project.setBusinessType(optional(req.businessType(), 120));
        project.setProjectBrief(required(req.projectBrief(), 4000, "Descrição do site"));
        project.setRequestedPages(optional(req.requestedPages(), 1000));
        project.setDesignReferences(optional(req.designReferences(), 1000));
        project.setPreferredDomain(optional(req.preferredDomain(), 255));
        return SiteProjectResponse.from(projects.save(project));
    }

    @Transactional(readOnly = true)
    public List<SiteProjectResponse> myProjects(String email) {
        User user = current(email);
        return projects.findByUserIdOrderByUpdatedAtDesc(user.getId())
            .stream().map(SiteProjectResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<SiteProjectResponse> allProjects(String email) {
        requireAdmin(current(email));
        return projects.findAllByOrderByUpdatedAtDesc()
            .stream().map(SiteProjectResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public SiteProjectResponse detail(Long projectId, String email) {
        return SiteProjectResponse.from(allowedProject(projectId, current(email)));
    }

    @Transactional(readOnly = true)
    public List<SiteProjectMessageResponse> listMessages(Long projectId, String email) {
        SiteProject p = allowedProject(projectId, current(email));
        return messages.findByProjectIdOrderByCreatedAtAscIdAsc(p.getId())
            .stream().map(SiteProjectMessageResponse::from).toList();
    }

    @Transactional
    public SiteProjectMessageResponse addMessage(
        Long projectId, SiteProjectMessageRequest req, String email
    ) {
        User actor = current(email);
        SiteProject project = allowedProject(projectId, actor);
        SiteProjectMessage entry = new SiteProjectMessage();
        entry.setProject(project);
        entry.setAuthor(actor);
        entry.setMessage(required(req == null ? null : req.message(), 4000, "Mensagem"));
        return SiteProjectMessageResponse.from(messages.save(entry));
    }

    @Transactional
    public SiteProjectResponse deliver(Long projectId, SiteProjectDeliveryRequest req, String email) {
        User admin = current(email);
        requireAdmin(admin);
        SiteProject project = allowedProject(projectId, admin);
        String url = required(req == null ? null : req.deliveryUrl(), 1000, "Link do site");
        try {
            URI parsed = URI.create(url);
            if (!"https".equalsIgnoreCase(parsed.getScheme()) || parsed.getHost() == null
                    || parsed.getUserInfo() != null) {
                throw new IllegalArgumentException();
            }
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Use um endereço HTTPS válido.");
        }
        project.setDeliveryUrl(url);
        project.setStatus(SiteProject.Status.DELIVERED);
        SiteProject saved = projects.save(project);

        SiteProjectMessage message = new SiteProjectMessage();
        message.setProject(saved);
        message.setAuthor(admin);
        String note = optional(req.message(), 2000);
        message.setMessage((note != null ? note + "\n\n" : "") + "Seu site está disponível em: " + url);
        messages.save(message);
        return SiteProjectResponse.from(saved);
    }

    @Transactional
    public SiteProjectResponse changeStatus(Long projectId, String value, String email) {
        User admin = current(email);
        requireAdmin(admin);
        SiteProject project = allowedProject(projectId, admin);
        try {
            project.setStatus(SiteProject.Status.valueOf(value));
        } catch (IllegalArgumentException | NullPointerException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Status inválido.");
        }
        return SiteProjectResponse.from(projects.save(project));
    }
}
