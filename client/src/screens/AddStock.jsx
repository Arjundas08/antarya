import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { Camera, Mic, PenLine, Check, Plus } from 'lucide-react';
import VoiceButton from '../components/VoiceButton';
import api from '../api';

export default function AddStock() {
  const { showToast } = useStore();
  const navigate = useNavigate();
  const [mode, setMode] = useState(null); // 'photo', 'voice', 'manual'
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const videoRef = useRef(null);
  const [photoTaken, setPhotoTaken] = useState(false);
  const [scannedItems, setScannedItems] = useState([]);

  // Manual mode state
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [addQty, setAddQty] = useState('');
  const [addCost, setAddCost] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // New product state
  const [showNewProduct, setShowNewProduct] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newQty, setNewQty] = useState('');
  const [newUnit, setNewUnit] = useState('pc');

  useEffect(() => {
    api.getProducts().then(setProducts).catch(console.error);
  }, []);

  const startCamera = async () => {
    setMode('photo');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      showToast('Camera not available. Use manual mode.', 'error');
      setMode(null);
    }
  };

  const takePhoto = () => {
    // Simulate OCR scanning with existing products
    const stream = videoRef.current?.srcObject;
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setPhotoTaken(true);

    // Simulate scanning delay
    setTimeout(() => {
      // Create simulated scan results from existing low-stock products
      const simulated = products
        .filter(p => p.quantity < p.minStock * 2)
        .slice(0, 4)
        .map(p => ({
          productId: p.id,
          name: p.name,
          quantity: Math.round(Math.random() * 20 + 10),
          unit: p.unit,
          totalCost: Math.round((Math.random() * 20 + 10) * p.costPrice),
          costPrice: p.costPrice
        }));

      if (simulated.length === 0) {
        // Use first 3 products as fallback
        products.slice(0, 3).forEach(p => {
          simulated.push({
            productId: p.id,
            name: p.name,
            quantity: Math.round(Math.random() * 20 + 10),
            unit: p.unit,
            totalCost: Math.round((Math.random() * 20 + 10) * p.costPrice),
            costPrice: p.costPrice
          });
        });
      }

      setScannedItems(simulated);
    }, 2000);
  };

  const handleVoiceResult = (text) => {
    // Parse voice: "50 kg rice at 2000 rupees"
    const items = [];
    const parts = text.toLowerCase().split(/[,and]+/);

    for (const part of parts) {
      for (const product of products) {
        const names = [
          product.name.toLowerCase(),
          ...(product.name.toLowerCase().split(/[\s()]+/))
        ].filter(n => n.length > 2);

        for (const name of names) {
          if (part.includes(name)) {
            const numbers = part.match(/\d+/g)?.map(Number) || [];
            const qty = numbers[0] || 10;
            const cost = numbers[1] || Math.round(qty * product.costPrice);

            items.push({
              productId: product.id,
              name: product.name,
              quantity: qty,
              unit: product.unit,
              totalCost: cost,
              costPrice: product.costPrice
            });
            break;
          }
        }
      }
    }

    if (items.length > 0) {
      setScannedItems(items);
    } else {
      showToast('Could not identify items. Try manual mode.', 'error');
    }
  };

  const saveScanResults = async () => {
    setLoading(true);
    try {
      for (const item of scannedItems) {
        await api.addStock(item.productId, {
          quantity: item.quantity,
          costPrice: item.costPrice,
          totalCost: item.totalCost
        });
      }
      showToast(`${scannedItems.length} items restocked! ✅`);
      navigate('/stock');
    } catch (err) {
      showToast(err.message || 'Error saving stock', 'error');
    }
    setLoading(false);
  };

  const handleManualAdd = async () => {
    if (!selectedProduct || !addQty) {
      showToast('Select product and enter quantity', 'error');
      return;
    }
    setLoading(true);
    try {
      await api.addStock(selectedProduct.id, {
        quantity: Number(addQty),
        costPrice: selectedProduct.costPrice,
        totalCost: Number(addCost) || Number(addQty) * selectedProduct.costPrice
      });
      showToast(`${selectedProduct.name} +${addQty} ${selectedProduct.unit} added! ✅`);
      setSelectedProduct(null);
      setAddQty('');
      setAddCost('');
      // Refresh products
      const updated = await api.getProducts();
      setProducts(updated);
    } catch (err) {
      showToast(err.message || 'Error', 'error');
    }
    setLoading(false);
  };

  const handleNewProduct = async () => {
    if (!newName || !newPrice) {
      showToast('Enter name and price', 'error');
      return;
    }
    setLoading(true);
    try {
      await api.addProduct({
        name: newName,
        sellingPrice: Number(newPrice),
        costPrice: Math.round(Number(newPrice) * 0.75),
        quantity: Number(newQty) || 0,
        unit: newUnit,
        minStock: 5
      });
      showToast(`${newName} added! ✅`);
      setShowNewProduct(false);
      setNewName('');
      setNewPrice('');
      setNewQty('');
      const updated = await api.getProducts();
      setProducts(updated);
    } catch (err) {
      showToast(err.message || 'Error', 'error');
    }
    setLoading(false);
  };

  return (
    <div className="page">
      <h1 className="page-title">Add Stock 📦</h1>
      <p className="page-subtitle">Add new stock to your shop</p>

      {/* Mode Selection */}
      {!mode && scannedItems.length === 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
          <button className="btn btn-primary btn-full" onClick={startCamera} style={{ padding: '20px 24px' }}>
            <Camera size={22} /> 📷 Take Photo of Bill
          </button>
          <button className="btn btn-secondary btn-full" onClick={() => setMode('voice')} style={{ padding: '20px 24px' }}>
            <Mic size={22} /> 🎤 Speak Stock Details
          </button>
          <button className="btn btn-secondary btn-full" onClick={() => setMode('manual')} style={{ padding: '20px 24px' }}>
            <PenLine size={22} /> ✏️ Type Manually
          </button>

          {/* Quick: show low stock items */}
          {products.filter(p => p.quantity <= p.minStock).length > 0 && (
            <>
              <div className="section-title" style={{ marginTop: 12 }}>⚠️ Needs Restocking</div>
              {products.filter(p => p.quantity <= p.minStock).map(p => (
                <div className="list-item" key={p.id} onClick={() => {
                  setMode('manual');
                  setSelectedProduct(p);
                }}>
                  <div className="list-item-content">
                    <div className="list-item-title">{p.name}</div>
                    <div className="list-item-sub">{p.quantity} {p.unit} left</div>
                  </div>
                  <span className={`badge ${p.quantity <= 2 ? 'badge-critical' : 'badge-low'}`}>
                    {p.quantity <= 2 ? '🚨 CRITICAL' : '⚠️ LOW'}
                  </span>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* Camera Mode */}
      {mode === 'photo' && !photoTaken && (
        <div style={{ marginTop: 16 }}>
          <div style={{
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            background: '#000',
            aspectRatio: '4/3',
            position: 'relative',
            marginBottom: 16
          }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-primary btn-full" onClick={takePhoto}>
              📸 Capture Bill
            </button>
            <button className="btn btn-secondary" onClick={() => { setMode(null); const s = videoRef.current?.srcObject; if(s) s.getTracks().forEach(t => t.stop()); }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Photo Scanning */}
      {mode === 'photo' && photoTaken && scannedItems.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <div className="spinner"></div>
          <p style={{ color: 'var(--text-secondary)', marginTop: 16 }}>Scanning your bill...</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 4 }}>Reading items and prices</p>
        </div>
      )}

      {/* Voice Mode */}
      {mode === 'voice' && scannedItems.length === 0 && (
        <div style={{ marginTop: 16 }}>
          <VoiceButton onResult={handleVoiceResult} label="Speak Stock Details" />
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: -10 }}>
            Try: "50 kilo rice at 2000 rupees, 20 litre oil at 1800"
          </p>
          <button className="btn btn-secondary btn-sm" onClick={() => setMode(null)} style={{ display: 'block', margin: '16px auto' }}>
            ← Back
          </button>
        </div>
      )}

      {/* Scan Results */}
      {scannedItems.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div className="alert-banner success">
            <span className="alert-icon">✅</span>
            <div className="alert-text">
              <div className="alert-title">Found {scannedItems.length} items</div>
              <div className="alert-desc">Review and confirm</div>
            </div>
          </div>

          {scannedItems.map((item, i) => (
            <div className="card" key={i}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{item.name}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: 4 }}>
                    +{item.quantity} {item.unit} • ₹{item.totalCost}
                  </div>
                </div>
                <Check size={20} color="var(--success)" />
              </div>
            </div>
          ))}

          <div className="card" style={{ background: 'var(--glass-strong)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 600 }}>Total Cost</span>
              <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--accent)' }}>
                ₹{scannedItems.reduce((s, i) => s + i.totalCost, 0).toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
            <button className="btn btn-primary btn-full" onClick={saveScanResults} disabled={loading}>
              {loading ? 'Saving...' : '✅ Correct? Save Stock'}
            </button>
            <button className="btn btn-secondary" onClick={() => { setScannedItems([]); setMode(null); setPhotoTaken(false); }}>
              ✏️ Edit
            </button>
          </div>
        </div>
      )}

      {/* Manual Mode */}
      {mode === 'manual' && (
        <div style={{ marginTop: 16 }}>
          {!selectedProduct ? (
            <>
              <input
                className="input"
                placeholder="Search product to restock..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                autoFocus
                style={{ marginBottom: 12 }}
              />
              <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                {products
                  .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map(p => (
                    <div className="list-item" key={p.id} onClick={() => setSelectedProduct(p)}>
                      <div className="list-item-content">
                        <div className="list-item-title">{p.name}</div>
                        <div className="list-item-sub">Current: {p.quantity} {p.unit}</div>
                      </div>
                      <span className={`badge ${p.quantity <= 2 ? 'badge-critical' : p.quantity <= p.minStock ? 'badge-low' : 'badge-ok'}`}>
                        {p.quantity} {p.unit}
                      </span>
                    </div>
                  ))
                }
              </div>

              {/* Add new product button */}
              <button
                className="btn btn-secondary btn-full"
                onClick={() => setShowNewProduct(true)}
                style={{ marginTop: 12 }}
              >
                <Plus size={16} /> Add New Product
              </button>

              <button className="btn btn-secondary btn-sm" onClick={() => setMode(null)} style={{ display: 'block', margin: '12px auto' }}>
                ← Back
              </button>
            </>
          ) : (
            <div className="card">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 4 }}>{selectedProduct.name}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 16 }}>
                Current stock: {selectedProduct.quantity} {selectedProduct.unit}
              </p>

              <div className="input-group">
                <label>Add Quantity ({selectedProduct.unit})</label>
                <input
                  className="input"
                  type="number"
                  placeholder={`e.g. 20`}
                  value={addQty}
                  onChange={e => setAddQty(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="input-group">
                <label>Total Cost (₹) - Optional</label>
                <input
                  className="input"
                  type="number"
                  placeholder={`e.g. ${addQty ? Math.round(Number(addQty) * selectedProduct.costPrice) : '0'}`}
                  value={addCost}
                  onChange={e => setAddCost(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-primary btn-full" onClick={handleManualAdd} disabled={loading}>
                  {loading ? 'Adding...' : `✅ Add ${addQty || 0} ${selectedProduct.unit}`}
                </button>
                <button className="btn btn-secondary" onClick={() => setSelectedProduct(null)}>
                  ← Back
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* New Product Modal */}
      {showNewProduct && (
        <div className="modal-overlay" onClick={() => setShowNewProduct(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-handle"></div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16 }}>Add New Product</h3>

            <div className="input-group">
              <label>Product Name</label>
              <input className="input" placeholder="e.g. Parle G" value={newName}
                onChange={e => setNewName(e.target.value)} autoFocus />
            </div>
            <div className="input-row">
              <div className="input-group">
                <label>Selling Price (₹)</label>
                <input className="input" type="number" placeholder="e.g. 10"
                  value={newPrice} onChange={e => setNewPrice(e.target.value)} />
              </div>
              <div className="input-group">
                <label>Initial Quantity</label>
                <input className="input" type="number" placeholder="e.g. 50"
                  value={newQty} onChange={e => setNewQty(e.target.value)} />
              </div>
            </div>
            <div className="input-group">
              <label>Unit</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {['pc', 'kg', 'L', 'g', 'ml', 'dozen'].map(u => (
                  <button
                    key={u}
                    className={`btn btn-sm ${newUnit === u ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setNewUnit(u)}
                    style={{ padding: '6px 12px' }}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>

            <button className="btn btn-primary btn-full" onClick={handleNewProduct} disabled={loading}>
              {loading ? 'Adding...' : '✅ Add Product'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
