import React, { useState } from 'react';
import './App.css';

function App() {
  const [products, setProducts] = useState([
    { id: 1, name: 'Notebook', qty: 12 },
    { id: 2, name: 'Pen Pack', qty: 30 },
  ]);
  const [name, setName] = useState('');
  const [qty, setQty] = useState(1);

  const addProduct = () => {
    if (!name.trim()) return alert('Please enter a product name.');
    setProducts(prev => [
      ...prev,
      { id: Date.now(), name: name.trim(), qty: Number(qty) || 0 },
    ]);
    setName('');
    setQty(1);
  };

  const changeQty = (id, delta) => {
    setProducts(prev =>
      prev.map(p => (p.id === id ? { ...p, qty: Math.max(0, p.qty + delta) } : p))
    );
  };

  const removeProduct = id => setProducts(prev => prev.filter(p => p.id !== id));

  return (
    <div className="app-root">
      <div className="hero">
        <h1>Inventory Playground</h1>
        <p className="tagline">Student-friendly demo UI — add, adjust, and explore.</p>
      </div>

      <div className="controls">
        <input
          className="input"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Product name"
          aria-label="Product name"
        />
        <input
          className="input small"
          type="number"
          value={qty}
          onChange={e => setQty(e.target.value)}
          min="0"
          aria-label="Quantity"
        />
        <button className="btn primary" onClick={addProduct}>Add Product</button>
        <button className="btn ghost" onClick={() => setProducts([])}>Clear All</button>
      </div>

      <div className="grid">
        {products.length === 0 ? (
          <div className="empty">No products yet — add one!</div>
        ) : (
          products.map(p => (
            <div className="card" key={p.id}>
              <div className="card-title">{p.name}</div>
              <div className="qty">Quantity: <strong>{p.qty}</strong></div>
              <div className="card-actions">
                <button className="btn" onClick={() => changeQty(p.id, 1)}>+1</button>
                <button className="btn" onClick={() => changeQty(p.id, -1)}>-1</button>
                <button className="btn danger" onClick={() => removeProduct(p.id)}>Remove</button>
              </div>
            </div>
          ))
        )}
      </div>

      <footer className="footer">Try clicking buttons — all changes are local to your browser.</footer>
    </div>
  );
}

export default App;
