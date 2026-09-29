package space.orbitta.backend.entity;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "renewal_email_logs",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_renewal_email_product_date_stage",
                        columnNames = {
                                "client_product_id",
                                "renewal_date",
                                "reminder_stage"
                        }
                )
        }
)
public class RenewalEmailLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "client_product_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_renewal_email_product"
            )
    )
    private ClientProduct clientProduct;

    @Column(
            name = "renewal_date",
            nullable = false
    )
    private LocalDate renewalDate;

    @Column(
            name = "reminder_stage",
            nullable = false,
            length = 30
    )
    private String reminderStage;

    @Column(
            name = "days_remaining",
            nullable = false
    )
    private Integer daysRemaining;

    @Column(
            nullable = false,
            length = 255
    )
    private String recipient;

    @Column(
            name = "provider_message_id",
            length = 255
    )
    private String providerMessageId;

    @Column(
            name = "sent_at",
            nullable = false
    )
    private LocalDateTime sentAt;

    @PrePersist
    public void prePersist() {
        if (sentAt == null) {
            sentAt = LocalDateTime.now();
        }
    }

    public Long getId() {
        return id;
    }

    public ClientProduct getClientProduct() {
        return clientProduct;
    }

    public void setClientProduct(
            ClientProduct clientProduct
    ) {
        this.clientProduct = clientProduct;
    }

    public LocalDate getRenewalDate() {
        return renewalDate;
    }

    public void setRenewalDate(
            LocalDate renewalDate
    ) {
        this.renewalDate = renewalDate;
    }

    public String getReminderStage() {
        return reminderStage;
    }

    public void setReminderStage(
            String reminderStage
    ) {
        this.reminderStage = reminderStage;
    }

    public Integer getDaysRemaining() {
        return daysRemaining;
    }

    public void setDaysRemaining(
            Integer daysRemaining
    ) {
        this.daysRemaining = daysRemaining;
    }

    public String getRecipient() {
        return recipient;
    }

    public void setRecipient(
            String recipient
    ) {
        this.recipient = recipient;
    }

    public String getProviderMessageId() {
        return providerMessageId;
    }

    public void setProviderMessageId(
            String providerMessageId
    ) {
        this.providerMessageId =
                providerMessageId;
    }

    public LocalDateTime getSentAt() {
        return sentAt;
    }
}
