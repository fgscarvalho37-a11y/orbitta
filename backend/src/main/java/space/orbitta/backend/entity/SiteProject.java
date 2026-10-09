package space.orbitta.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "site_projects", indexes = {
    @Index(name = "idx_site_projects_user", columnList = "user_id")
})
public class SiteProject {
    public enum Status { BRIEF_RECEIVED, IN_PROGRESS, IN_REVIEW, DELIVERED }

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "checkout_id", nullable = false, unique = true)
    private SubscriptionCheckout checkout;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    @Column(nullable = false, length = 140)
    private String businessName;
    @Column(nullable = false, length = 255)
    private String contactEmail;
    @Column(length = 40)
    private String contactPhone;
    @Column(length = 120)
    private String businessType;
    @Column(nullable = false, length = 4000)
    private String projectBrief;
    @Column(length = 1000)
    private String requestedPages;
    @Column(length = 1000)
    private String designReferences;
    @Column(length = 255)
    private String preferredDomain;
    @Column(nullable = false, length = 30)
    @Enumerated(EnumType.STRING)
    private Status status = Status.BRIEF_RECEIVED;
    @Column(name = "delivery_url", length = 1000)
    private String deliveryUrl;
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist void onCreate() { createdAt = LocalDateTime.now(); updatedAt = createdAt; }
    @PreUpdate void onUpdate() { updatedAt = LocalDateTime.now(); }

    public Long getId() { return id; }
    public SubscriptionCheckout getCheckout() { return checkout; }
    public void setCheckout(SubscriptionCheckout value) { checkout = value; }
    public User getUser() { return user; }
    public void setUser(User value) { user = value; }
    public String getBusinessName() { return businessName; }
    public void setBusinessName(String value) { businessName = value; }
    public String getContactEmail() { return contactEmail; }
    public void setContactEmail(String value) { contactEmail = value; }
    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String value) { contactPhone = value; }
    public String getBusinessType() { return businessType; }
    public void setBusinessType(String value) { businessType = value; }
    public String getProjectBrief() { return projectBrief; }
    public void setProjectBrief(String value) { projectBrief = value; }
    public String getRequestedPages() { return requestedPages; }
    public void setRequestedPages(String value) { requestedPages = value; }
    public String getDesignReferences() { return designReferences; }
    public void setDesignReferences(String value) { designReferences = value; }
    public String getPreferredDomain() { return preferredDomain; }
    public void setPreferredDomain(String value) { preferredDomain = value; }
    public Status getStatus() { return status; }
    public void setStatus(Status value) { status = value; }
    public String getDeliveryUrl() { return deliveryUrl; }
    public void setDeliveryUrl(String value) { deliveryUrl = value; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
