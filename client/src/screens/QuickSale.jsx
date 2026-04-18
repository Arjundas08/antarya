import { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { Check, X, Plus, Minus, User, ShoppingBag } from 'lucide-react';
import VoiceButton from '../components/VoiceButton';
import api from '../api';

export default function QuickSale() {
  const { showToast } = useStore();
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [saleItems, setSaleItems] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [success, setSuccess] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [manualSearch, setManualSearch] = useState('');

  // Udhaar state
  const [showUdhaar, setShowUdhaar] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');

  // Customer name for cash sale (optional)
  const [buyerName, setBuyerName] = useState('');

  useEffect(() => {
    api.getProducts().then(setProducts).catch(console.error);
    api.getCustomers().then(setCustomers).catch(console.error);
  }, []);

  // Hindi/English number mapping
  const numberWords = {
    'ek': 1, 'एक': 1, 'one': 1,
    'do': 2, 'दो': 2, 'two': 2,
    'teen': 3, 'तीन': 3, 'three': 3,
    'char': 4, 'चार': 4, 'four': 4,
    'paanch': 5, 'पांच': 5, 'five': 5,
    'chhe': 6, 'छह': 6, 'six': 6,
    'saat': 7, 'सात': 7, 'seven': 7,
    'aath': 8, 'आठ': 8, 'eight': 8,
    'nau': 9, 'नौ': 9, 'nine': 9,
    'das': 10, 'दस': 10, 'ten': 10,
    'half': 0.5, 'aadha': 0.5, 'आधा': 0.5,
  };

  const parseVoiceInput = (text) => {
    const input = text.toLowerCase();
    const found = [];

    for (const product of products) {
      const names = [
        product.name.toLowerCase(),
        product.nameHindi?.toLowerCase(),
        ...product.name.toLowerCase().split(/[\s()]+/)
      ].filter(Boolean);

      for (const name of names) {
        if (name.length < 2) continue;
        if (input.includes(name)) {
          let qty = 1;
          const words = input.split(/[\s,]+/);
          const nameIndex = words.findIndex(w => w.includes(name) || name.includes(w));

          for (let i = Math.max(0, nameIndex - 2); i <= Math.min(words.length - 1, nameIndex + 2); i++) {
            const word = words[i];
            if (numberWords[word]) { qty = numberWords[word]; break; }
            const num = parseFloat(word);
            if (!isNaN(num) && num > 0 && num <= 100) { qty = num; break; }
          }

          if (!found.find(f => f.productId === product.id)) {
            found.push({
              productId: product.id,
              productName: product.name,
              quantity: qty,
              unit: product.unit,
              price: product.sellingPrice,
              itemTotal: qty * product.sellingPrice
            });
          }
          break;
        }
      }
    }
    return found;
  };

  const handleVoiceResult = (text) => {
    setTranscript(text);
    const items = parseVoiceInput(text);
    if (items.length > 0) {
      setSaleItems(items);
      setShowResult(true);
    } else {
      showToast('Could not find items. Try again or add manually.', 'error');
    }
  };

  const addManualItem = (product) => {
    const existing = saleItems.find(i => i.productId === product.id);
    if (existing) {
      setSaleItems(saleItems.map(i =>
        i.productId === product.id
          ? { ...i, quantity: i.quantity + 1, itemTotal: (i.quantity + 1) * i.price }
          : i
      ));
    } else {
      setSaleItems([...saleItems, {
        productId: product.id,
        productName: product.name,
        quantity: 1,
        unit: product.unit,
        price: product.sellingPrice,
        itemTotal: product.sellingPrice
      }]);
    }
    setShowResult(true);
    setShowManual(false);
    setManualSearch('');
  };

  const updateQty = (productId, delta) => {
    setSaleItems(prev => prev.map(item => {
      if (item.productId === productId) {
        const newQty = Math.max(0.5, item.quantity + delta);
        return { ...item, quantity: newQty, itemTotal: newQty * item.price };
      }
      return item;
    }));
  };

  const removeItem = (productId) => {
    const updated = saleItems.filter(i => i.productId !== productId);
    setSaleItems(updated);
    if (updated.length === 0) setShowResult(false);
  };

  const total = saleItems.reduce((sum, i) => sum + i.itemTotal, 0);

  const completeSale = async (paymentType, udhaarName) => {
    setLoading(true);
    try {
      const saleData = {
        items: saleItems.map(i => ({ productId: i.productId, quantity: i.quantity })),
        paymentType,
      };

      // Add customer name
      if (paymentType === 'udhaar' && udhaarName) {
        saleData.customerName = udhaarName;
      } else if (buyerName.trim()) {
        saleData.customerName = buyerName.trim();
      }

      await api.recordSale(saleData);
      setSuccess(true);
      showToast(`₹${Math.round(total)} sale recorded${paymentType === 'udhaar' ? ` — udhaar for ${udhaarName}` : ''} ✅`);

      setTimeout(() => {
        setSaleItems([]);
        setShowResult(false);
        setSuccess(false);
        setTranscript('');
        setBuyerName('');
        setCustomerName('');
        setShowUdhaar(false);
      }, 2500);
    } catch (err) {
      showToast(err.message || 'Sale failed', 'error');
    }
    setLoading(false);
  };

  // Success Screen
  if (success) {
    return (
      <div className="page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>
        <div className="success-check"><Check size={44} /></div>
        <h2 style={{ fontFamily: 'var(--font-display)', marginTop: 16, fontSize: '1.5rem', fontWeight: 800 }}>Sale Complete! 🎉</h2>
        <p style={{ color: 'var(--accent)', marginTop: 8, fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>
          ₹{Math.round(total)}
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 6 }}>Stock updated automatically</p>
      </div>
    );
  }

  // Filtered customers for udhaar
  const filteredCustomers = customerSearch
    ? customers.filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase()))
    : customers;

  return (
    <div className="page">
      <h1 className="page-title">Quick Sale 🎤</h1>
      <p className="page-subtitle">Speak or select items to sell</p>

      {/* Voice Input Area */}
      {!showResult && (
        <>
          <VoiceButton onResult={handleVoiceResult} />

          <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: -6, marginBottom: 20 }}>
            Try: "ek kilo atta, do Maggi, ek litre oil"
          </p>

          <div style={{ textAlign: 'center' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setShowManual(!showManual)}>
              ✏️ Add Manually
            </button>
          </div>
        </>
      )}

      {/* Manual Search */}
      {showManual && (
        <div style={{ marginTop: 16 }}>
          <input className="input" placeholder="Search item name..." value={manualSearch}
            onChange={e => setManualSearch(e.target.value)} autoFocus />
          <div style={{ maxHeight: 280, overflowY: 'auto', marginTop: 8 }}>
            {products
              .filter(p => !manualSearch || p.name.toLowerCase().includes(manualSearch.toLowerCase()))
              .map(product => (
                <div key={product.id} className="list-item" onClick={() => addManualItem(product)}>
                  <div className="list-item-content">
                    <div className="list-item-title">{product.name}</div>
                    <div className="list-item-sub">{product.quantity} {product.unit} available</div>
                  </div>
                  <div className="list-item-value" style={{ color: 'var(--accent)' }}>
                    ₹{product.sellingPrice}/{product.unit}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Sale Result */}
      {showResult && saleItems.length > 0 && (
        <div className="sale-result">
          {transcript && (
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 14, fontStyle: 'italic',
              padding: '8px 12px', background: 'var(--glass)', borderRadius: 'var(--radius-sm)' }}>
              🎤 "{transcript}"
            </div>
          )}

          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', fontWeight: 700, marginBottom: 10,
            textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--text-secondary)' }}>
            Sale Items
          </h3>

          {saleItems.map(item => (
            <div className="sale-item-row" key={item.productId}>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem' }}>{item.productName}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
                  <button className="btn btn-icon" style={{ width: 30, height: 30 }}
                    onClick={() => updateQty(item.productId, -0.5)}>
                    <Minus size={14} />
                  </button>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, minWidth: 50, textAlign: 'center', fontSize: '0.95rem' }}>
                    {item.quantity} {item.unit}
                  </span>
                  <button className="btn btn-icon" style={{ width: 30, height: 30 }}
                    onClick={() => updateQty(item.productId, 0.5)}>
                    <Plus size={14} />
                  </button>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem' }}>₹{Math.round(item.itemTotal)}</div>
                <button onClick={() => removeItem(item.productId)}
                  style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600, marginTop: 4 }}>
                  Remove
                </button>
              </div>
            </div>
          ))}

          {/* Total */}
          <div className="sale-total-row">
            <span>Total</span>
            <span style={{ color: 'var(--accent)' }}>₹{Math.round(total)}</span>
          </div>

          {/* Add more */}
          <button className="btn btn-secondary btn-sm btn-full" onClick={() => setShowManual(true)} style={{ marginTop: 14 }}>
            <Plus size={14} /> Add More Items
          </button>

          {/* Customer Name (optional for cash) */}
          <div style={{ marginTop: 14 }}>
            <div className="input-group" style={{ marginBottom: 8 }}>
              <label>Customer Name (optional)</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input className="input" placeholder="e.g. Sharma Ji"
                  value={buyerName} onChange={e => setBuyerName(e.target.value)}
                  style={{ flex: 1 }} />
              </div>
            </div>
          </div>

          {/* Payment Buttons */}
          {!showUdhaar ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
              <button className="btn btn-success btn-lg" onClick={() => completeSale('cash')} disabled={loading}>
                💵 Cash – ₹{Math.round(total)}
              </button>
              <button className="btn btn-secondary btn-lg" onClick={() => setShowUdhaar(true)} disabled={loading}
                style={{ borderColor: 'rgba(251, 191, 36, 0.2)' }}>
                📋 Udhaar
              </button>
            </div>
          ) : (
            /* Udhaar Customer Selection */
            <div className="card" style={{ marginTop: 12, borderColor: 'rgba(251, 191, 36, 0.2)' }}>
              <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <User size={16} /> Udhaar – Who is buying?
              </h4>

              {/* New customer name */}
              <div className="input-group">
                <label>Customer Name</label>
                <input className="input" placeholder="Type customer name..."
                  value={customerName} onChange={e => { setCustomerName(e.target.value); setCustomerSearch(e.target.value); }}
                  autoFocus />
              </div>

              {/* Existing customers dropdown */}
              {customerSearch && filteredCustomers.length > 0 && (
                <div style={{ maxHeight: 150, overflowY: 'auto', marginBottom: 12 }}>
                  {filteredCustomers.slice(0, 5).map(c => (
                    <div key={c.id} className="list-item" style={{ padding: '8px 12px', marginBottom: 4 }}
                      onClick={() => { setCustomerName(c.name); setCustomerSearch(''); }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{c.name}</div>
                      {c.totalCredit > 0 && (
                        <span className="badge badge-low" style={{ marginLeft: 'auto' }}>
                          ₹{Math.round(c.totalCredit)} due
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <button className="btn btn-primary btn-lg"
                  onClick={() => {
                    if (!customerName.trim()) {
                      showToast('Enter customer name for udhaar', 'error');
                      return;
                    }
                    completeSale('udhaar', customerName.trim());
                  }}
                  disabled={loading || !customerName.trim()}>
                  📋 Confirm ₹{Math.round(total)}
                </button>
                <button className="btn btn-secondary" onClick={() => { setShowUdhaar(false); setCustomerName(''); }}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Cancel Button */}
          <button className="btn btn-ghost btn-full" onClick={() => {
            setSaleItems([]); setShowResult(false); setTranscript(''); setShowUdhaar(false); setCustomerName('');
          }} style={{ marginTop: 8, color: 'var(--danger)' }}>
            <X size={16} /> Cancel Sale
          </button>
        </div>
      )}

      {/* Recent Sales */}
      {!showResult && <RecentSales />}
    </div>
  );
}

function RecentSales() {
  const [sales, setSales] = useState([]);

  useEffect(() => {
    api.getTodaySales()
      .then(data => setSales(data.sales || []))
      .catch(console.error);
  }, []);

  if (sales.length === 0) {
    return (
      <div className="empty-state" style={{ marginTop: 30 }}>
        <div className="emoji">🛒</div>
        <h3>No sales today yet</h3>
        <p>Use the mic to make your first sale!</p>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 24 }}>
      <div className="section-title">📋 Today's Sales ({sales.length})</div>
      {sales.slice(0, 8).map(sale => (
        <div className="list-item" key={sale.id}>
          <div style={{
            width: 38, height: 38, borderRadius: 'var(--radius-sm)',
            background: sale.paymentType === 'cash' ? 'var(--success-bg)' : 'var(--warning-bg)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0
          }}>
            {sale.paymentType === 'cash' ? '💵' : '📋'}
          </div>
          <div className="list-item-content">
            <div className="list-item-title">
              {sale.items?.map(i => `${i.productName} (${i.quantity})`).join(', ') || 'Sale'}
            </div>
            <div className="list-item-sub" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span>{new Date(sale.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
              <span>•</span>
              <span style={{ color: sale.paymentType === 'udhaar' ? 'var(--warning)' : 'var(--success)', fontWeight: 600 }}>
                {sale.paymentType === 'cash' ? 'Cash' : 'Udhaar'}
              </span>
              {sale.customerName && (
                <>
                  <span>•</span>
                  <span style={{ color: 'var(--text-primary)' }}>👤 {sale.customerName}</span>
                </>
              )}
            </div>
          </div>
          <div className="list-item-value" style={{ color: 'var(--success)', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1rem' }}>
            ₹{Math.round(sale.total)}
          </div>
        </div>
      ))}
    </div>
  );
}
