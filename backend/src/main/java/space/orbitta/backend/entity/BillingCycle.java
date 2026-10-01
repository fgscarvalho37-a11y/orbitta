package space.orbitta.backend.entity;

import java.math.BigDecimal;

public enum BillingCycle {
    MONTHLY(1, 1),
    ANNUAL(10, 12);

    private final int priceMultiplier;
    private final int renewalMonths;

    BillingCycle(
            int priceMultiplier,
            int renewalMonths
    ) {
        this.priceMultiplier =
                priceMultiplier;
        this.renewalMonths =
                renewalMonths;
    }

    public BigDecimal applyTo(
            BigDecimal monthlyPrice
    ) {
        if (monthlyPrice == null) {
            return BigDecimal.ZERO;
        }

        return monthlyPrice.multiply(
                BigDecimal.valueOf(
                        priceMultiplier
                )
        );
    }

    public int getRenewalMonths() {
        return renewalMonths;
    }

    public static BillingCycle normalize(
            BillingCycle value
    ) {
        return value == null
                ? MONTHLY
                : value;
    }
}
