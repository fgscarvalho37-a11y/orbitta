package space.orbitta.backend.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "custom_offers",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_custom_offers_token",
                        columnNames = "token"
                )
        },
        indexes = {
                @Index(
                        name = "idx_custom_offers_user",
                        columnList = "user_id"
                ),
                @Index(
                        name = "idx_custom_offers_active",
                        columnList = "active"
                )
        }
)
public class CustomOffer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 80)
    private String token;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "offer_type", nullable = false, length = 40)
    private CustomOfferType offerType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "catalog_plan_id")
    private CatalogPlan catalogPlan;

    @Column(nullable = false, length = 140)
    private String title;

    @Column(length = 500)
    private String description;

    @Column(name = "monthly_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal monthlyPrice = BigDecimal.ZERO;

    @Column(name = "setup_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal setupPrice = BigDecimal.ZERO;

    @Column(nullable = false, length = 3)
    private String currency = "USD";

    @Column(name = "one_time_only", nullable = false)
    private boolean oneTimeOnly;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Column(name = "checkout_id")
    private Long checkoutId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }

    public String getToken() { return token; }

    public void setToken(String token) { this.token = token; }

    public User getUser() { return user; }

    public void setUser(User user) { this.user = user; }

    public CustomOfferType getOfferType() { return offerType; }

    public void setOfferType(CustomOfferType offerType) { this.offerType = offerType; }

    public CatalogPlan getCatalogPlan() { return catalogPlan; }

    public void setCatalogPlan(CatalogPlan catalogPlan) { this.catalogPlan = catalogPlan; }

    public String getTitle() { return title; }

    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }

    public void setDescription(String description) { this.description = description; }

    public BigDecimal getMonthlyPrice() { return monthlyPrice; }

    public void setMonthlyPrice(BigDecimal monthlyPrice) { this.monthlyPrice = monthlyPrice; }

    public BigDecimal getSetupPrice() { return setupPrice; }

    public void setSetupPrice(BigDecimal setupPrice) { this.setupPrice = setupPrice; }

    public String getCurrency() { return currency; }

    public void setCurrency(String currency) { this.currency = currency; }

    public boolean isOneTimeOnly() { return oneTimeOnly; }

    public void setOneTimeOnly(boolean oneTimeOnly) { this.oneTimeOnly = oneTimeOnly; }

    public boolean isActive() { return active; }

    public void setActive(boolean active) { this.active = active; }

    public LocalDateTime getExpiresAt() { return expiresAt; }

    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }

    public Long getCheckoutId() { return checkoutId; }

    public void setCheckoutId(Long checkoutId) { this.checkoutId = checkoutId; }

    public LocalDateTime getCreatedAt() { return createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
