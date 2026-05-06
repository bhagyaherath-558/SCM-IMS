package com.inventory.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "stock_transactions")
@Data
public class StockTransaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long transactionId;

    @Column(nullable = false)
    private Long productId;

    @Enumerated(EnumType.STRING)
    private TransactionType transactionType;

    private Integer quantity;
    private String referenceDoc;
    private LocalDateTime transactionDate = LocalDateTime.now();
}

