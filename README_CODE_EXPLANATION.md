# SCM-IMS: Code Explanations and Definitions

This file provides a comprehensive guide explaining the purpose, architecture, and definitions for every class and file in the Inventory Management System (SCM-IMS).

---

## 1. Backend Components (Java / Spring Boot)

All backend Java files are located inside the `src/main/java/com/inventory/` directory.

### A. Main Application Entry
#### **[InventoryManagementApplication.java](file:///C:/Users/ACER/.gemini/antigravity/scratch/SCM-IMS/src/main/java/com/inventory/InventoryManagementApplication.java)**
*   **Definition**: The entry point of the Spring Boot application.
*   **How it works**: It is annotated with `@SpringBootApplication` which enables auto-configuration, component scanning (discovering services and controllers), and property configurations. The `main` method calls `SpringApplication.run(InventoryManagementApplication.class, args)` to launch the embedded Tomcat server on port 8080.

---

### B. Database Entities (Models)
Entities represent tables in the MySQL database. They are annotated with Hibernate/JPA annotations.

#### **[Product.java](file:///C:/Users/ACER/.gemini/antigravity/scratch/SCM-IMS/src/main/java/com/inventory/entity/Product.java)**
*   **Definition**: Maps to the `products` table, storing catalog information about items.
*   **Key Fields**:
    *   `productId` (Long, `@Id`, `@GeneratedValue`): Primary Key, auto-incremented by the database.
    *   `name` (String, `@Column(nullable = false)`): The name of the product.
    *   `sku` (String, `@Column(unique = true)`): Stock Keeping Unit, a unique identifier code.
    *   `category` (String): Product classification (e.g., Electronics, Food).
    *   `unitPrice` (Double): Selling price per unit.
    *   `image` (String, `@Column(columnDefinition = "LONGTEXT")`): Stores the Base64 Data URL string of the product photo (added by Member 5).
*   **Lombok Annotations**: `@Data` generates getters, setters, `toString()`, `equals()`, and `hashCode()` at compile time.

#### **[Inventory.java](file:///C:/Users/ACER/.gemini/antigravity/scratch/SCM-IMS/src/main/java/com/inventory/entity/Inventory.java)**
*   **Definition**: Maps to the `inventory` table, tracking current stock levels for each product.
*   **Key Fields**:
    *   `inventoryId` (Long): Primary Key.
    *   `productId` (Long, `@Column(nullable = false)`): Foreign Key reference linking back to the product.
    *   `quantityOnHand` (Integer): The current amount of stock units physically present in the warehouse. Defaults to `0`.
    *   `reorderLevel` (Integer): Threshold level. If `quantityOnHand` falls below this value, a "Low Stock!" alert is triggered. Defaults to `10`.

#### **[StockTransaction.java](file:///C:/Users/ACER/.gemini/antigravity/scratch/SCM-IMS/src/main/java/com/inventory/entity/StockTransaction.java)**
*   **Definition**: Maps to the `stock_transactions` table, logging every stock adjustment (IN/OUT) for auditing.
*   **Key Fields**:
    *   `transactionId` (Long): Primary Key.
    *   `productId` (Long): The product that was adjusted.
    *   `transactionType` (TransactionType): Enum value (`IN` or `OUT`).
    *   `quantity` (Integer): Quantity of items added or removed.
    *   `transactionDate` (LocalDateTime): Date/Time stamp, automatically recorded.
    *   `referenceDoc` (String): Invoice or Purchase Order reference number (e.g. "PO-1002").

#### **[TransactionType.java](file:///C:/Users/ACER/.gemini/antigravity/scratch/SCM-IMS/src/main/java/com/inventory/entity/TransactionType.java)**
*   **Definition**: An enum (Enumeration) defining the type of stock operation.
*   **Values**:
    *   `IN`: Stock receipt (inventory increases).
    *   `OUT`: Stock issuance/sales (inventory decreases).

---

### C. Repositories (Data Access Layer)
Repositories extend Spring Data JPA interfaces to provide automated SQL queries (CRUD) on database tables.

#### **[ProductRepository.java](file:///C:/Users/ACER/.gemini/antigravity/scratch/SCM-IMS/src/main/java/com/inventory/repository/ProductRepository.java)**
*   **Definition**: Interfaces CRUD operations for the `Product` entity.

#### **[InventoryRepository.java](file:///C:/Users/ACER/.gemini/antigravity/scratch/SCM-IMS/src/main/java/com/inventory/repository/InventoryRepository.java)**
*   **Definition**: Interfaces operations for `Inventory` balances.
*   **Custom Methods**:
    *   `Optional<Inventory> findByProductId(Long productId)`: Looks up current stock details for a specific product.
    *   `List<Inventory> findByQuantityOnHandLessThan(Integer threshold)`: Used to retrieve all inventory items below their reorder level.

#### **[StockTransactionRepository.java](file:///C:/Users/ACER/.gemini/antigravity/scratch/SCM-IMS/src/main/java/com/inventory/repository/StockTransactionRepository.java)**
*   **Definition**: Interfaces operations for `StockTransaction` logs.

---

### D. Service Layer (Business Logic)
#### **[InventoryService.java](file:///C:/Users/ACER/.gemini/antigravity/scratch/SCM-IMS/src/main/java/com/inventory/service/InventoryService.java)**
*   **Definition**: The class annotated with `@Service` containing core business rules. It orchestrates database queries and transaction controls.
*   **Key Methods**:
    *   `getAllInventory()`: Fetches all inventory records.
    *   `getLowStockAlerts()`: Fetches items where quantity < 10.
    *   `addStock(productId, quantity, referenceDoc)` (annotated with `@Transactional`):
        *   Finds the product in the inventory.
        *   Adds the quantity to `quantityOnHand`.
        *   Saves the updated inventory.
        *   Logs a new `StockTransaction` of type `IN`.
    *   `reduceStock(productId, quantity, referenceDoc)` (annotated with `@Transactional`):
        *   Finds the product in the inventory.
        *   Checks if there is enough stock. If not, returns an error.
        *   Subtracts the quantity from `quantityOnHand`.
        *   Saves the updated inventory.
        *   Logs a new `StockTransaction` of type `OUT`.
    *   `checkAvailability(productId, quantity)`: Checks if a product has enough stock on hand.

---

### E. Controller Layer (REST API Endpoints)
#### **[InventoryController.java](file:///C:/Users/ACER/.gemini/antigravity/scratch/SCM-IMS/src/main/java/com/inventory/controller/InventoryController.java)**
*   **Definition**: Contains REST API controllers to handle incoming HTTP requests from the frontend and return JSON data.
*   **Key Annotations**:
    *   `@RestController`: Marks the class as a web controller returning serialized JSON.
    *   `@RequestMapping`: Specifies base path mapping.
    *   `@CrossOrigin`: Configures CORS (Cross-Origin Resource Sharing) allowing ports `3000` and `3002` to contact the backend.
*   **Controllers mapped in this file**:
    1.  **`InventoryController`** (mapped to `/api/inventory`):
        *   `GET /api/inventory`: Calls service to load all inventory levels.
        *   `GET /api/inventory/low-stock`: Returns low stock alert items.
        *   `POST /api/inventory/add`: Accepts a JSON body and increases stock.
        *   `POST /api/inventory/reduce`: Accepts a JSON body and decreases stock.
        *   `GET /api/inventory/check/{id}?quantity=X`: Checks availability.
    2.  **`ProductController`** (mapped to `/api/products`):
        *   `GET /api/products`: Returns the complete product catalog.
        *   `POST /api/products`: Saves a new product to database, and automatically initializes an `Inventory` record for it with `0` stock.

---

## 2. Frontend Components (React & Stylesheets)

The frontend is a React single-page application located inside the `frontend/` folder.

### A. JavaScript Application Logic
#### **[App.js](file:///C:/Users/ACER/.gemini/antigravity/scratch/SCM-IMS/frontend/src/App.js)**
*   **Definition**: The primary React file containing states, functions, layout structure, and API calls.
*   **Key States (`useState`)**:
    *   `inventory`: Stores the current list of inventory balances.
    *   `products`: Stores the list of products (used to retrieve product name and images).
    *   `lowStockItems`: Array of items currently below reorder levels.
    *   `showAddProduct` / `showStockOps`: Booleans that toggle creation and transaction modal boxes.
    *   `newProduct` / `stockData`: Store temporary inputs from forms.
    *   `message`: Stores text and styling attributes (`success` / `error`) for the popups.
    *   `lightboxImage`: Holds the Base64 image payload when clicking a thumbnail to show the lightbox.
    *   `searchTerm`, `selectedCategory`, `stockStatusFilter`, `sortBy` (added for Search & Filter): Capture filter controls.
*   **Side Effects (`useEffect`)**:
    *   Triggers `loadData()` once when the page loads.
*   **Methods**:
    *   `loadData()`: Asynchronously gets products and inventory from backend simultaneously.
    *   `handleImageUpload(e)`: Standard HTML File reader hook. Uses `FileReader.readAsDataURL` to convert an uploaded image file into a Base64 string for saving.
    *   `addProduct()`: Calls `POST /api/products` sending JSON with Base64 image string.
    *   `addStock()` / `reduceStock()`: Connect stock operations forms to `/api/inventory/add` or `/reduce`.
*   **Search, Filter & Sort Algorithm**:
    *   `categories`: Dynamically maps over `products` to extract distinct categories.
    *   `filteredInventory`: Filters the `inventory` array based on `searchTerm`, matching `selectedCategory`, and checking if `stockStatusFilter` isolates items above/below reorder levels. It then sorts the final list by `name`, `price`, `quantity`, or `id` before mapping it to table rows.

---

### B. Styling Classes
#### **[App.css](file:///C:/Users/ACER/.gemini/antigravity/scratch/SCM-IMS/frontend/src/App.css)**
*   **Definition**: Custom stylesheet mapping visual elements, fonts, colors, grids, layouts, and responsive properties.
*   **Core Layout Selectors**:
    *   `.app`, `.header`: Set width, center align, and paint black gradient backdrops.
    *   `.stats`, `.stat-card`: Implement modern CSS grids to display dashboard summaries.
    *   `.actions`: Form buttons wrapper with gray background, flex wrapping, and rounded corners.
    *   `.modal`, `.modal-content`: Centered lightbox overlay panels with absolute positioning and fade-in animations.
    *   `.message`: Fixed floating status popups (sliding in from the right).
    *   `.inventory-table`, `table`: Borders, hover rows (`tr:hover`), header cells, and responsive scrolling.
    *   `.image-upload-container`, `.upload-preview`: Custom uploader layouts and preview boxes.
    *   `.product-thumbnail`, `.product-thumbnail-placeholder` (added by Member 5): Design criteria for circular thumbnails (circle shape, borders, shadows, hover zoom transitions).
    *   `.lightbox`, `.lightbox-img` (added by Member 5): Dark fullscreen overlay and responsive container to display full-size photos.
    *   `.filter-bar`, `.filter-group`, `.btn-clear` (added for Search/Filter): Styling specifications for inputs, selects, labels, and margins of the search bar.

---

## 3. PowerShell Scripts

PowerShell scripts located at the project root folder simplify local setup by bypassing environment variable configuration.

#### **[run_backend.ps1](file:///C:/Users/ACER/.gemini/antigravity/scratch/SCM-IMS/run_backend.ps1)**
*   **Definition**: Automatically detects JDK folders under `C:\Program Files\Java\jdk-*`, binds your `JAVA_HOME` variables, hooks your local Maven binary (located in the scratch folder), and starts the Spring Boot backend (`mvn spring-boot:run`).

#### **[run_frontend.ps1](file:///C:/Users/ACER/.gemini/antigravity/scratch/SCM-IMS/run_frontend.ps1)**
*   **Definition**: Navigates to the `frontend` folder and starts the local React development server (`npm start`).
