import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  // State variables - like memory boxes
  const [inventory, setInventory] = useState([]);
  const [products, setProducts] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showStockOps, setShowStockOps] = useState(false);
  const [showEditProduct, setShowEditProduct] = useState(false);
  
  // Form data
  const [newProduct, setNewProduct] = useState({
    name: '',
    sku: '',
    category: '',
    unitPrice: ''
  });
  
  const [stockData, setStockData] = useState({
    productId: '',
    quantity: '',
    referenceDoc: ''
  });

  const [editingProduct, setEditingProduct] = useState({
    productId: '',
    name: '',
    sku: '',
    category: '',
    unitPrice: '',
    reorderLevel: ''
  });
  
  const [message, setMessage] = useState({ text: '', type: '' });

  // Load data when page opens
  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch both products and inventory
  const loadData = async () => {
    try {
      // Load products first
      const productsRes = await axios.get('http://localhost:8080/api/products');
      setProducts(productsRes.data);

      // Load inventory
      const inventoryRes = await axios.get('http://localhost:8080/api/inventory');
      setInventory(inventoryRes.data);
      
      // Filter low stock items (quantity < reorderLevel)
      const lowStock = inventoryRes.data.filter(item => item.quantityOnHand < item.reorderLevel);
      setLowStockItems(lowStock);
    } catch (error) {
      showMessage('Cannot connect to server! Make sure backend is running.', 'error');
    }
  };

  // Show popup message
  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  // Add new product
  const addProduct = async () => {
    if (!newProduct.name || !newProduct.sku || !newProduct.unitPrice) {
      showMessage('Please fill all fields!', 'error');
      return;
    }

    try {
      await axios.post('http://localhost:8080/api/products', {
        name: newProduct.name,
        sku: newProduct.sku,
        category: newProduct.category,
        unitPrice: parseFloat(newProduct.unitPrice)
      });
      
      showMessage('Product added successfully!', 'success');
      setNewProduct({ name: '', sku: '', category: '', unitPrice: '' });
      setShowAddProduct(false);
      loadData();
    } catch (error) {
      const text = error?.response?.data?.message || error.message || 'Error adding product';
      showMessage(text, 'error');
      console.error('addProduct error:', error);
    }
  };

  // Add stock
  const addStock = async () => {
    if (!stockData.productId || !stockData.quantity) {
      showMessage('Please select product and enter quantity!', 'error');
      return;
    }

    try {
      const res = await axios.post('http://localhost:8080/api/inventory/add', {
        productId: parseInt(stockData.productId),
        quantity: parseInt(stockData.quantity),
        referenceDoc: stockData.referenceDoc || 'MANUAL-001'
      });
      
      showMessage(`Added ${stockData.quantity} units! (${res.data.previousQuantity} → ${res.data.newQuantity})`, 'success');
      setStockData({ productId: '', quantity: '', referenceDoc: '' });
      setShowStockOps(false);
      loadData();
    } catch (error) {
      showMessage('Error adding stock', 'error');
    }
  };

  // Reduce stock
  const reduceStock = async () => {
    if (!stockData.productId || !stockData.quantity) {
      showMessage('Please select product and enter quantity!', 'error');
      return;
    }

    try {
      const res = await axios.post('http://localhost:8080/api/inventory/reduce', {
        productId: parseInt(stockData.productId),
        quantity: parseInt(stockData.quantity),
        referenceDoc: stockData.referenceDoc || 'SALE-001'
      });
      
      if (res.data.success) {
        showMessage(`Sold ${stockData.quantity} units! (${res.data.previousQuantity} → ${res.data.newQuantity})`, 'success');
      } else {
        showMessage(`${res.data.error}`, 'error');
      }
      
      setStockData({ productId: '', quantity: '', referenceDoc: '' });
      setShowStockOps(false);
      loadData();
    } catch (error) {
      showMessage('Error reducing stock', 'error');
    }
  };

  // Helper functions for matching product details in inventory list
  const getProductName = (productId) => {
    const product = products.find(p => p.productId === productId);
    return product ? product.name : `Product ${productId}`;
  };

  const getProductSku = (productId) => {
    const product = products.find(p => p.productId === productId);
    return product ? product.sku : '-';
  };

  const getProductCategory = (productId) => {
    const product = products.find(p => p.productId === productId);
    return product ? product.category || 'General' : '-';
  };

  const getProductPrice = (productId) => {
    const product = products.find(p => p.productId === productId);
    return product ? `$${product.unitPrice.toFixed(2)}` : '-';
  };

  // Handle Edit Button Click
  const handleEditClick = (item) => {
    const product = products.find(p => p.productId === item.productId);
    if (product) {
      setEditingProduct({
        productId: product.productId,
        name: product.name,
        sku: product.sku,
        category: product.category || '',
        unitPrice: product.unitPrice,
        reorderLevel: item.reorderLevel
      });
      setShowEditProduct(true);
    }
  };

  // Save product changes
  const saveProductEdit = async () => {
    if (!editingProduct.name || !editingProduct.sku || !editingProduct.unitPrice) {
      showMessage('Please fill all required fields!', 'error');
      return;
    }

    try {
      await axios.put(`http://localhost:8080/api/products/${editingProduct.productId}`, {
        name: editingProduct.name,
        sku: editingProduct.sku,
        category: editingProduct.category,
        unitPrice: parseFloat(editingProduct.unitPrice),
        reorderLevel: parseInt(editingProduct.reorderLevel)
      });

      showMessage('Product updated successfully!', 'success');
      setShowEditProduct(false);
      loadData();
    } catch (error) {
      const text = error?.response?.data?.message || error.message || 'Error updating product';
      showMessage(text, 'error');
    }
  };

  // Delete product action
  const handleDeleteClick = async (productId) => {
    const name = getProductName(productId);
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${name}"?\nThis will permanently delete the product, its stock levels, and transaction history!`
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:8080/api/products/${productId}`);
      showMessage('Product deleted successfully!', 'success');
      loadData();
    } catch (error) {
      showMessage('Error deleting product', 'error');
    }
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <h1>Inventory Management System</h1>
        <p>Track your products and stock levels easily</p>
      </header>

      {/* Popup Message */}
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Stats Cards */}
      <div className="stats">
        <div className="stat-card">
          <div className="stat-number">{inventory.length}</div>
          <div className="stat-label">Total Products</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            {inventory.reduce((sum, item) => sum + item.quantityOnHand, 0)}
          </div>
          <div className="stat-label">Total Stock Units</div>
        </div>
        <div className="stat-card warning">
          <div className="stat-number">{lowStockItems.length}</div>
          <div className="stat-label">Low Stock Alerts</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="actions">
        <button className="btn btn-primary" onClick={() => setShowAddProduct(true)}>
           Add New Product
        </button>
        <button className="btn btn-success" onClick={() => setShowStockOps(true)}>
           Stock Operations
        </button>
      </div>

      {/* Add Product Modal */}
      {showAddProduct && (
        <div className="modal">
          <div className="modal-content">
            <h2>Add New Product</h2>
            <input
              type="text"
              placeholder="Product Name *"
              value={newProduct.name}
              onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
            />
            <input
              type="text"
              placeholder="SKU (Unique Code) *"
              value={newProduct.sku}
              onChange={(e) => setNewProduct({...newProduct, sku: e.target.value})}
            />
            <input
              type="text"
              placeholder="Category"
              value={newProduct.category}
              onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
            />
            <input
              type="number"
              placeholder="Price *"
              value={newProduct.unitPrice}
              onChange={(e) => setNewProduct({...newProduct, unitPrice: e.target.value})}
            />
            <div className="modal-buttons">
              <button className="btn btn-success" onClick={addProduct}>Save Product</button>
              <button className="btn btn-danger" onClick={() => setShowAddProduct(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditProduct && (
        <div className="modal">
          <div className="modal-content">
            <h2>Edit Product Details</h2>
            <div className="form-group">
              <label>Product Name *</label>
              <input
                type="text"
                placeholder="Product Name *"
                value={editingProduct.name}
                onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>SKU (Unique Code) *</label>
              <input
                type="text"
                placeholder="SKU (Unique Code) *"
                value={editingProduct.sku}
                onChange={(e) => setEditingProduct({...editingProduct, sku: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Category</label>
              <input
                type="text"
                placeholder="Category"
                value={editingProduct.category}
                onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Unit Price ($) *</label>
              <input
                type="number"
                placeholder="Price *"
                value={editingProduct.unitPrice}
                onChange={(e) => setEditingProduct({...editingProduct, unitPrice: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Reorder Level *</label>
              <input
                type="number"
                placeholder="Reorder Level *"
                value={editingProduct.reorderLevel}
                onChange={(e) => setEditingProduct({...editingProduct, reorderLevel: e.target.value})}
              />
            </div>
            <div className="modal-buttons">
              <button className="btn btn-success" onClick={saveProductEdit}>Save Changes</button>
              <button className="btn btn-danger" onClick={() => setShowEditProduct(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Stock Operations Modal */}
      {showStockOps && (
        <div className="modal">
          <div className="modal-content">
            <h2>Stock Operations</h2>
            <select
              value={stockData.productId}
              onChange={(e) => setStockData({...stockData, productId: e.target.value})}
            >
              <option value="">Select Product</option>
              {inventory.map(item => (
                <option key={item.productId} value={item.productId}>
                  {getProductName(item.productId)} - Stock: {item.quantityOnHand}
                </option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Quantity"
              value={stockData.quantity}
              onChange={(e) => setStockData({...stockData, quantity: e.target.value})}
            />
            <input
              type="text"
              placeholder="Reference (PO/SO Number)"
              value={stockData.referenceDoc}
              onChange={(e) => setStockData({...stockData, referenceDoc: e.target.value})}
            />
            <div className="modal-buttons">
              <button className="btn btn-primary" onClick={addStock}>  Add Stock (IN)</button>
              <button className="btn btn-warning" onClick={reduceStock}> Reduce Stock (OUT)</button>
              <button className="btn btn-danger" onClick={() => setShowStockOps(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Table */}
      <div className="inventory-table">
        <h2>Current Inventory</h2>
        {inventory.length === 0 ? (
          <div className="empty-state">
            <p>No products yet. Click "Add New Product" to get started!</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>SKU</th>
                <th>Product Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Reorder Level</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map(item => {
                const isLowStock = item.quantityOnHand < item.reorderLevel;
                return (
                  <tr key={item.inventoryId} className={isLowStock ? 'low-stock-row' : ''}>
                    <td>{item.productId}</td>
                    <td><code className="sku-badge">{getProductSku(item.productId)}</code></td>
                    <td><strong>{getProductName(item.productId)}</strong></td>
                    <td>{getProductCategory(item.productId)}</td>
                    <td>{getProductPrice(item.productId)}</td>
                    <td className={isLowStock ? 'low-stock font-bold' : ''}>
                      {item.quantityOnHand}
                    </td>
                    <td>{item.reorderLevel}</td>
                    <td>
                      {isLowStock ? (
                        <span className="badge badge-danger"> Low Stock!</span>
                      ) : (
                        <span className="badge badge-success">In Stock</span>
                      )}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn btn-small btn-edit" onClick={() => handleEditClick(item)}>
                          Edit
                        </button>
                        <button className="btn btn-small btn-delete" onClick={() => handleDeleteClick(item.productId)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer */}
      <footer className="footer">
        <p>Inventory Management System </p>
      </footer>
    </div>
  );
}

export default App;