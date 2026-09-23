package space.orbitta.backend.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "subscription_checkouts",
        indexes = {
                @Index(
                        name = "idx_subscription_checkouts_user",
                        columnList = "user_id"
                ),
                @Index(
                        name = "idx_subscription_checkouts_status",
                        columnList = "status"
                ),
                @Index(
                        name = "idx_subscription_checkouts_plan",
                        columnList = "catalog_plan_id"
                )
        }
)
public class SubscriptionCheckout {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "user_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_subscription_checkouts_user"
            )
    )
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "catalog_product_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_subscription_checkouts_catalog_product"
            )
    )
    private CatalogProduct catalogProduct;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "catalog_plan_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_subscription_checkouts_catalog_plan"
            )
    )
    private CatalogPlan catalogPlan;

    /*
     * Snapshot comercial.
     *
     * O catálogo pode mudar depois que o checkout começou.
     * Estes valores registram exatamente o que estava sendo
     * contratado naquele momento.
     */

    @Column(
            name = "product_name",
            nullable = false,
            length = 100
    )
    private String productName;

    @Column(
            name = "plan_name",
            nullable = false,
            length = 100
    )
    private String planName;

    @Column(
            name = "monthly_price",
            nullable = false,
            precision = 10,
            scale = 2
    )
    private BigDecimal monthlyPrice;

    @Column(
            name = "setup_price",
            nullable = false,
            precision = 10,
            scale = 2
    )
    private BigDecimal setupPrice;

    @Column(
            nullable = false,
            length = 10
    )
    private String currency;

    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false,
            length = 30
    )
    private SubscriptionCheckoutStatus status;

    /*
     * Campos preparados para o gateway.
     * Por enquanto podem ficar null.
     */

    @Column(
            name = "payment_provider",
            length = 50
    )
    private String paymentProvider;

    @Column(
            name = "external_payment_id",
            length = 150
    )
    private String externalPaymentId;

    @Column(
            name = "external_reference",
            unique = true,
            length = 100
    )
    private String externalReference;

    @Column(
            name = "approved_at"
    )
    private LocalDateTime approvedAt;

    @Column(
            name = "cancelled_at"
    )
    private LocalDateTime cancelledAt;

    @Column(
            name = "expires_at"
    )
    private LocalDateTime expiresAt;

    @Column(
            name = "created_at",
            nullable = false
    )
    private LocalDateTime createdAt;

    @Column(
            name = "updated_at",
            nullable = false
    )
    private LocalDateTime updatedAt;

    public SubscriptionCheckout() {
    }

    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();

        createdAt = now;
        updatedAt = now;

        if (status == null) {
            status = SubscriptionCheckoutStatus.PENDING;
        }

        if (setupPrice == null) {
            setupPrice = BigDecimal.ZERO;
        }
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public CatalogProduct getCatalogProduct() {
        return catalogProduct;
    }

    public void setCatalogProduct(CatalogProduct catalogProduct) {
        this.catalogProduct = catalogProduct;
    }

    public CatalogPlan getCatalogPlan() {
        return catalogPlan;
    }

    public void setCatalogPlan(CatalogPlan catalogPlan) {
        this.catalogPlan = catalogPlan;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public String getPlanName() {
        return planName;
    }

    public void setPlanName(String planName) {
        this.planName = planName;
    }

    public BigDecimal getMonthlyPrice() {
        return monthlyPrice;
    }

    public void setMonthlyPrice(BigDecimal monthlyPrice) {
        this.monthlyPrice = monthlyPrice;
    }

    public BigDecimal getSetupPrice() {
        return setupPrice;
    }

    public void setSetupPrice(BigDecimal setupPrice) {
        this.setupPrice = setupPrice;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public SubscriptionCheckoutStatus getStatus() {
        return status;
    }

    public void setStatus(
            SubscriptionCheckoutStatus status
    ) {
        this.status = status;
    }

    public String getPaymentProvider() {
        return paymentProvider;
    }

    public void setPaymentProvider(
            String paymentProvider
    ) {
        this.paymentProvider = paymentProvider;
    }

    public String getExternalPaymentId() {
        return externalPaymentId;
    }

    public void setExternalPaymentId(
            String externalPaymentId
    ) {
        this.externalPaymentId = externalPaymentId;
    }

    public String getExternalReference() {
        return externalReference;
    }

    public void setExternalReference(
            String externalReference
    ) {
        this.externalReference = externalReference;
    }

    public LocalDateTime getApprovedAt() {
        return approvedAt;
    }

    public void setApprovedAt(
            LocalDateTime approvedAt
    ) {
        this.approvedAt = approvedAt;
    }

    public LocalDateTime getCancelledAt() {
        return cancelledAt;
    }

    public void setCancelledAt(
            LocalDateTime cancelledAt
    ) {
        this.cancelledAt = cancelledAt;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(
            LocalDateTime expiresAt
    ) {
        this.expiresAt = expiresAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}