package space.orbitta.backend.dto;

import space.orbitta.backend.entity.ClientProduct;
import space.orbitta.backend.entity.ProductStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record ClientProductResponse(

        Long id,
        String name,
        String subtitle,
        String planName,
        BigDecimal monthlyPrice,
        String domain,
        String systemUrl,
        ProductStatus status,
        LocalDate renewalDate,
        LocalDateTime createdAt,
        LocalDateTime updatedAt

) {

    public static ClientProductResponse from(
            ClientProduct product
    ) {
        return new ClientProductResponse(
                product.getId(),
                product.getName(),
                product.getSubtitle(),
                product.getPlanName(),
                product.getMonthlyPrice(),
                product.getDomain(),
                product.getSystemUrl(),
                product.getStatus(),
                product.getRenewalDate(),
                product.getCreatedAt(),
                product.getUpdatedAt()
        );
    }
}