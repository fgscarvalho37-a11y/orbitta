package space.orbitta.backend.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "support_tickets",
        indexes = {
                @Index(
                        name = "idx_support_tickets_user",
                        columnList = "user_id"
                ),
                @Index(
                        name = "idx_support_tickets_status",
                        columnList = "status"
                )
        }
)
public class SupportTicket {

    public enum Status {
        OPEN,
        IN_PROGRESS,
        RESOLVED
    }

    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
    )
    private Long id;

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "user_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_support_tickets_user"
            )
    )
    private User user;

    @Column(
            name = "product_name",
            nullable = false,
            length = 100
    )
    private String productName;

    @Column(
            nullable = false,
            length = 60
    )
    private String category;

    @Column(
            nullable = false,
            length = 160
    )
    private String subject;

    @Column(
            nullable = false,
            length = 4000
    )
    private String message;

    @Enumerated(
            EnumType.STRING
    )
    @Column(
            nullable = false,
            length = 30
    )
    private Status status =
            Status.OPEN;

    @Column(
            name = "created_at",
            nullable = false,
            updatable = false
    )
    private LocalDateTime createdAt;

    @Column(
            name = "updated_at",
            nullable = false
    )
    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        LocalDateTime now =
                LocalDateTime.now();

        createdAt = now;
        updatedAt = now;

        if (status == null) {
            status = Status.OPEN;
        }
    }

    @PreUpdate
    void onUpdate() {
        updatedAt =
                LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(
            User user
    ) {
        this.user = user;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(
            String productName
    ) {
        this.productName =
                productName;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(
            String category
    ) {
        this.category =
                category;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(
            String subject
    ) {
        this.subject =
                subject;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(
            String message
    ) {
        this.message =
                message;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(
            Status status
    ) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
