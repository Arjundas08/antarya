import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { Search, Plus, Edit2, Trash2, Package } from 'lucide-react';
import api from '../api';

export default function MyStock() {
  const { showToast } = useStore();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, low, critical
  const [editingId, setEditingId] = useState(null);
  const [editQty, setEditQty] = useState('');
  const [editPrice, setEditPrice] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await api.getProducts();
      setProducts(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const getStatus = (product) => {
    if (product.quantity <= 0) return { label: '🚫 OUT', class: 'badge-critical' };
    if (product.quantity <= 2) return { label: '🚨 ORDER NOW', class: 'badge-critical' };
    if (product.quantity <= product.minStock) return { label: '⚠️ LOW', class: 'badge-low' };
    return { label: '✅ OK', class: 'badge-ok' };
  };

  const filteredProducts = products
    .filter(p => {
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return p.name.toLowerCase().includes(term) || (p.nameHindi && p.nameHindi.includes(searchTerm));
      }
      return true;
    })
    .filter(p => {
      if (filter === 'low') return p.quantity <= p.minStock && p.quantity > 0;
      if (filter === 'critical') return p.quantity <= 2;
      return true;
    })
    .sort((a, b) => a.quantity - b.quantity);

  const lowCount = products.filter(p => p.quantity <= p.minStock && p.quantity > 0).length;
  const criticalCount = products.filter(p => p.quantity <= 2).length;

  const handleUpdate = async (product) => {
    try {
      const updates = {};
      if (editQty !== '') updates.quantity = Number(editQty);
      if (editPrice !== '') updates.sellingPrice = Number(editPrice);

      await api.updateProduct(product.id, updates);
      showToast(`${product.name} updated! ✅`);
      setEditingId(null);
      setEditQty('');
      setEditPrice('');
      loadProducts();
    } catch (err) {
      showToast(err.message || 'Update failed', 'error');
    }
  };

  const handleDelete = async (product) => {
    if (!confirm(`Delete ${product.name}?`)) return;
    try {
      await api.deleteProduct(product.id);
      showToast(`${product.name} deleted`);
      loadProducts();
    } catch (err) {
      showToast(err.message || 'Delete failed', 'error');
    }
  };

  if (loading) {
    return <div className="page"><div className="spinner"></div></div>;
  }

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <h1 className="page-title">My Stock 📦</h1>
        <button className="btn btn-primary btn-sm" onClick={() => navigate('/add-stock')}>
          <Plus size={16} /> Add
        </button>
      </div>
      <p className="page-subtitle">{products.length} items in your shop</p>

      {/* Search */}
      <div className="search-bar">
        <Search />
        <input
          className="input"
          placeholder="Search items..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          id="search-stock"
        />
      </div>

      {/* Filter Tabs */}
      <div className="tabs">
        <button className={`tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
          All ({products.length})
        </button>
        <button className={`tab ${filter === 'low' ? 'active' : ''}`} onClick={() => setFilter('low')}>
          Low ({lowCount})
        </button>
        <button className={`tab ${filter === 'critical' ? 'active' : ''}`} onClick={() => setFilter('critical')}>
          Critical ({criticalCount})
        </button>
      </div>

      {/* Order Low Items Button */}
      {lowCount > 0 && filter === 'all' && (
        <button
          className="btn btn-secondary btn-full"
          onClick={() => navigate('/add-stock')}
          style={{ marginBottom: 16 }}
        >
          🛒 Order {lowCount + criticalCount} Low Items
        </button>
      )}

      {/* Product List */}
      {filteredProducts.length === 0 ? (
        <div className="empty-state">
          <div className="emoji">📦</div>
          <h3>No items found</h3>
          <p>{searchTerm ? 'Try a different search' : 'Add some products to get started'}</p>
          <button className="btn btn-primary" onClick={() => navigate('/add-stock')}>
            <Plus size={16} /> Add Stock
          </button>
        </div>
      ) : (
        filteredProducts.map(product => {
          const status = getStatus(product);
          const isEditing = editingId === product.id;

          return (
            <div className="card" key={product.id} style={{ padding: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{product.name}</span>
                    <span className={`badge ${status.class}`}>{status.label}</span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                    ₹{product.sellingPrice}/{product.unit}
                    {product.costPrice > 0 && (
                      <span style={{ color: 'var(--text-muted)', marginLeft: 8 }}>
                        Cost: ₹{product.costPrice}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    fontSize: '1.3rem',
                    fontWeight: 800,
                    color: product.quantity <= product.minStock ? 'var(--warning)' : 'var(--text-primary)'
                  }}>
                    {product.quantity}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    {product.unit}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => {
                    if (isEditing) {
                      setEditingId(null);
                    } else {
                      setEditingId(product.id);
                      setEditQty(String(product.quantity));
                      setEditPrice(String(product.sellingPrice));
                    }
                  }}
                  style={{ flex: 1 }}
                >
                  <Edit2 size={14} /> {isEditing ? 'Cancel' : 'Edit'}
                </button>
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => {
                    navigate('/add-stock');
                  }}
                  style={{ flex: 1 }}
                >
                  <Plus size={14} /> Restock
                </button>
                <button
                  className="btn btn-sm btn-icon"
                  onClick={() => handleDelete(product)}
                  style={{ background: 'var(--danger-bg)', color: 'var(--danger)', width: 36, height: 36 }}
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Edit Form */}
              {isEditing && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--glass-border)' }}>
                  <div className="input-row">
                    <div className="input-group" style={{ marginBottom: 0 }}>
                      <label>Quantity</label>
                      <input
                        className="input"
                        type="number"
                        value={editQty}
                        onChange={e => setEditQty(e.target.value)}
                        style={{ padding: '10px 12px' }}
                      />
                    </div>
                    <div className="input-group" style={{ marginBottom: 0 }}>
                      <label>Price (₹)</label>
                      <input
                        className="input"
                        type="number"
                        value={editPrice}
                        onChange={e => setEditPrice(e.target.value)}
                        style={{ padding: '10px 12px' }}
                      />
                    </div>
                  </div>
                  <button
                    className="btn btn-success btn-sm btn-full"
                    onClick={() => handleUpdate(product)}
                    style={{ marginTop: 10 }}
                  >
                    ✅ Save Changes
                  </button>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
