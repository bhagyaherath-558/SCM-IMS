# Inventory Management System

A modern, full-stack web application for managing product inventory and stock levels with real-time tracking, low-stock alerts, and stock operations (in/out transactions).

## Features

- **Product Management** - Add and manage products with SKU, category, and pricing
- **Inventory Tracking** - Real-time stock level monitoring with reorder level management
- **Low Stock Alerts** - Automatic alerts when inventory falls below reorder levels
- **Stock Operations** - Add stock (IN) and reduce stock (OUT) with reference documentation
- **Responsive Dashboard** - Clean, modern white UI with black accents
- **Data Persistence** - MySQL database for reliable data storage
- **RESTful API** - Complete API for frontend-backend communication

## Tech Stack

### Backend
- **Java 21** - Latest LTS version
- **Spring Boot 4.0.6** - Modern web framework
- **Spring Data JPA** - ORM for database operations
- **Hibernate 7.2.12** - Persistence provider
- **MySQL 8.0** - Relational database
- **Maven** - Build management

### Frontend
- **React 18.x** - UI library
- **Axios** - HTTP client
- **CSS3** - Custom styling (white background, black buttons)
- **Node.js & npm** - JavaScript runtime and package manager

## Prerequisites

Ensure you have the following installed:
- **Java 21** ([Download](https://adoptium.net/temurin/releases/?version=21))
- **Node.js 16+** ([Download](https://nodejs.org/))
- **npm** (comes with Node.js)
- **MySQL 8.0+** ([Download](https://dev.mysql.com/downloads/mysql/))
- **Maven** (or use the included Maven wrapper)

##  Installation

### 1. Clone or Setup the Project

```bash
cd inventory-management
```

### 2. Backend Setup

Navigate to the backend directory:

```bash
cd inventory-management
```

**Create MySQL Database:**

```sql
CREATE DATABASE inventory_db;
USE inventory_db;
```

Update database credentials in `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/inventory_db?useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=your_password
```

### 3. Frontend Setup

Navigate to the frontend directory:

```bash
cd frontend
npm install
```

## Running the Application

### Start Backend (Port 8080)

```bash
cd inventory-management
./mvnw spring-boot:run
```

Or on Windows:

```cmd
mvnw.cmd spring-boot:run
```

**Backend will be available at:** `http://localhost:8080`

### Start Frontend (Port 3000)

```bash
cd frontend
npm start
```

**Frontend will be available at:** `http://localhost:3000`

## Usage

### Dashboard Overview
1. **Total Products** - Count of all registered products
2. **Total Stock Units** - Sum of all inventory quantities
3. **Low Stock Alerts** - Number of items below reorder level

### Adding a Product

1. Click **"Add New Product"** button
2. Fill in:
   - Product Name (required)
   - SKU - Unique code (required)
   - Category (optional)
   - Unit Price (required)
3. Click **"Save Product"**

### Stock Operations

1. Click **"Stock Operations"** button
2. Select a product from dropdown
3. Enter quantity
4. Add reference (Purchase Order / Sales Order number)
5. Choose:
   - **Add Stock (IN)** - Receive inventory
   - **Reduce Stock (OUT)** - Sell/Remove from inventory
6. Click appropriate button

### Inventory Table

- View all products with current stock levels
- Green badge = "In Stock"
- Red badge = "Low Stock!"
- Highlighted rows indicate items below reorder level

## API Endpoints

### Products API

```
POST   /api/products                 - Create product
GET    /api/products                 - Get all products
```

### Inventory API

```
GET    /api/inventory                - Get all inventory
GET    /api/inventory/low-stock      - Get low stock items
POST   /api/inventory/add            - Add stock
POST   /api/inventory/reduce         - Reduce stock
GET    /api/inventory/check/{id}     - Check availability
POST   /api/inventory/receive        - Receive from procurement
POST   /api/inventory/reserve        - Reserve for order
```

## Project Structure

```
inventory-management/
├── backend/
│   ├── src/main/java/com/inventory/
│   │   ├── InventoryManagementApplication.java
│   │   ├── controller/
│   │   │   └── InventoryController.java
│   │   ├── entity/
│   │   │   ├── Product.java
│   │   │   ├── Inventory.java
│   │   │   ├── StockTransaction.java
│   │   │   └── TransactionType.java
│   │   ├── repository/
│   │   │   ├── ProductRepository.java
│   │   │   ├── InventoryRepository.java
│   │   │   └── StockTransactionRepository.java
│   │   └── service/
│   │       └── InventoryService.java
│   ├── pom.xml
│   └── mvnw
├── frontend/
│   ├── src/
│   │   ├── App.js
│   │   ├── App.css
│   │   └── index.js
│   ├── package.json
│   └── README.md
└── README.md
```

## UI Design

### Color Scheme
- **Background**: Pure white (#ffffff)
- **Primary Buttons**: Black (#000000) with white text
- **Success**: Green (#27ae60)
- **Warning**: Orange (#f39c12)
- **Danger**: Red (#e74c3c)
- **Accents**: Light gray (#f8f8f8)

### Features
- Clean, modern interface optimized for students
- Responsive design for all screen sizes
- Smooth animations and transitions
- Intuitive modal dialogs
- Real-time data updates

## CORS Configuration

Backend is configured to accept requests from:
- `http://localhost:3000` (React dev server)
- `http://localhost:3002` (Alternate port)

To add more origins, update `@CrossOrigin` annotation in `InventoryController.java`.

## Notes

- Database tables are created automatically by Hibernate on first run
- Initial inventory data can be seeded via API calls
- Low stock threshold is set to 10 units (customizable in service layer)
- All dates stored in UTC timezone

## Troubleshooting

### Backend won't start
- Ensure MySQL is running
- Check database credentials in `application.properties`
- Verify port 8080 is not in use

### Frontend won't connect to backend
- Verify backend is running on port 8080
- Check browser console (F12) for CORS errors
- Ensure frontend is on port 3000

### Port already in use
Find and stop the process:
```bash
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :8080
kill -9 <PID>
```

## Future Enhancements

- [ ] User authentication & authorization
- [ ] Admin dashboard with analytics
- [ ] Export/Import inventory data
- [ ] Barcode scanning
- [ ] Email notifications for low stock
- [ ] Multi-warehouse support
- [ ] Inventory forecasting
- [ ] Audit trails & history tracking

##  License

This project is for educational purposes.

## Author

Reezma Hanan[https://github.com/reezmahanan]

---

**Happy Inventorying!**
