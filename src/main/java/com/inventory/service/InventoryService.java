package com.inventory.service;

import com.inventory.entity.Inventory;
import com.inventory.entity.StockTransaction;
import com.inventory.entity.TransactionType;
import com.inventory.repository.InventoryRepository;
import com.inventory.repository.StockTransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class InventoryService {

    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired
    private StockTransactionRepository transactionRepository;

    public List<Inventory> getAllInventory() {
        return inventoryRepository.findAll();
    }

    public List<Inventory> getLowStockAlerts() {
        return inventoryRepository.findByQuantityOnHandLessThan(10);
    }

    @Transactional
    public Map<String, Object> addStock(Long productId, Integer quantity, String referenceDoc) {
        Map<String, Object> response = new HashMap<>();
        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new RuntimeException("Product not found in inventory"));

        int previousQuantity = inventory.getQuantityOnHand();
        int newQuantity = previousQuantity + quantity;
        inventory.setQuantityOnHand(newQuantity);
        inventoryRepository.save(inventory);

        // Record transaction
        StockTransaction transaction = new StockTransaction();
        transaction.setProductId(productId);
        transaction.setTransactionType(TransactionType.IN);
        transaction.setQuantity(quantity);
        transaction.setReferenceDoc(referenceDoc);
        transactionRepository.save(transaction);

        response.put("success", true);
        response.put("previousQuantity", previousQuantity);
        response.put("newQuantity", newQuantity);
        return response;
    }

    @Transactional
    public Map<String, Object> reduceStock(Long productId, Integer quantity, String referenceDoc) {
        Map<String, Object> response = new HashMap<>();
        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new RuntimeException("Product not found in inventory"));

        int previousQuantity = inventory.getQuantityOnHand();
        if (previousQuantity < quantity) {
            response.put("success", false);
            response.put("error", "Insufficient stock. Available: " + previousQuantity);
            return response;
        }

        int newQuantity = previousQuantity - quantity;
        inventory.setQuantityOnHand(newQuantity);
        inventoryRepository.save(inventory);

        // Record transaction
        StockTransaction transaction = new StockTransaction();
        transaction.setProductId(productId);
        transaction.setTransactionType(TransactionType.OUT);
        transaction.setQuantity(quantity);
        transaction.setReferenceDoc(referenceDoc);
        transactionRepository.save(transaction);

        response.put("success", true);
        response.put("previousQuantity", previousQuantity);
        response.put("newQuantity", newQuantity);
        return response;
    }

    public boolean checkAvailability(Long productId, Integer quantity) {
        return inventoryRepository.findByProductId(productId)
                .map(inventory -> inventory.getQuantityOnHand() >= quantity)
                .orElse(false);
    }
}