package space.orbitta.backend.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "demo_access_logs",
        indexes = {
                @Index(
                        name = "idx_demo_access_logs_user_accessed",
                        columnList = "user_id, accessed_at"
                )
        }
)
public class DemoAccessLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "user_id",
            nullable = false
    )
    private User user;

    @Column(
            name = "accessed_at",
            nullable = false,
            updatable = false
    )
    private LocalDateTime accessedAt;

    @PrePersist
    protected void onCreate() {
        if (accessedAt == null) {
            accessedAt =
                    LocalDateTime.now();
        }
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

    public LocalDateTime getAccessedAt() {
        return accessedAt;
    }
}
