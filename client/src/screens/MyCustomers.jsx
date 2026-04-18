import { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { Search, Plus, UserPlus, Phone, CreditCard } from 'lucide-react';
import api from '../api';

export default function MyCustomers() {
  const { showToast } = useStore();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [payingId, setPayingId] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const data = await api.getCustomers();
      setCustomers(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleAddCustomer = async () => {
    if (!newName) { showToast('Enter customer name', 'error'); return; }
    try {
      await api.addCustomer({ name: newName, phone: newPhone });
      showToast(`${newName} added! ✅`);
      setShowAdd(false);
      setNewName('');
      setNewPhone('');
      loadCustomers();
    } catch (err) {
      showToast(err.message || 'Error', 'error');
    }
  };

  const handlePayCredit = async (customer) => {
    const amount = Number(payAmount);
    if (!amount || amount <= 0) { showToast('Enter valid amount', 'error'); return; }
    try {
      await api.payCredit(customer.id, amount);
      showToast(`₹${amount} received from ${customer.name} ✅`);
      setPayingId(null);
      setPayAmount('');
      loadCustomers();
    } catch (err) {
      showToast(err.message || 'Error', 'error');
    }
  };

  const formatMoney = (amount) => `₹${Math.round(amount || 0).toLocaleString('en-IN')}`;

  const getDaysSince = (date) => {
    if (!date) return null;
    return Math.floor((new Date() - new Date(date)) / 86400000);
  };

  const filtered = customers.filter(c => {
    if (searchTerm) {
      return c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.phone && c.phone.includes(searchTerm));
    }
    if (filter === 'credit') return (c.totalCredit || 0) > 0;
    if (filter === 'inactive') {
      const days = getDaysSince(c.lastVisit);
      return days !== null && days >= 10;
    }
    return true;
  });

  const totalCredit = customers.reduce((s, c) => s + (c.totalCredit || 0), 0);
  const creditCustomers = customers.filter(c => (c.totalCredit || 0) > 0).length;

  if (loading) return <div className="page"><div className="spinner"></div></div>;

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <h1 className="page-title">My Customers 👥</h1>
        <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>
          <UserPlus size={16} />
        </button>
      </div>
      <p className="page-subtitle">{customers.length} customers • {formatMoney(totalCredit)} udhaar pending</p>

      {/* Credit Summary */}
      {totalCredit > 0 && (
        <div className="alert-banner warning">
          <span className="alert-icon">📋</span>
          <div className="alert-text">
            <div className="alert-title">{formatMoney(totalCredit)} credit from {creditCustomers} customers</div>
            <div className="alert-desc">Collect to improve your cash flow</div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="search-bar">
        <Search />
        <input className="input" placeholder="Search customers..." value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)} />
      </div>

      {/* Filter */}
      <div className="tabs">
        <button className={`tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
          All
        </button>
        <button className={`tab ${filter === 'credit' ? 'active' : ''}`} onClick={() => setFilter('credit')}>
          Udhaar 📋
        </button>
        <button className={`tab ${filter === 'inactive' ? 'active' : ''}`} onClick={() => setFilter('inactive')}>
          Inactive ⚠️
        </button>
      </div>

      {/* Customer List */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="emoji">👥</div>
          <h3>No customers found</h3>
          <p>Customers are added automatically when you make udhaar sales</p>
        </div>
      ) : (
        filtered.map((customer, i) => {
          const daysSince = getDaysSince(customer.lastVisit);
          const isInactive = daysSince !== null && daysSince >= 10;
          const isPaying = payingId === customer.id;

          return (
            <div className="card" key={customer.id} style={{ padding: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 42,
                  height: 42,
                  borderRadius: 'var(--radius-md)',
                  background: `hsl(${(i * 37) % 360}, 50%, 20%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                  fontWeight: 800,
                  color: `hsl(${(i * 37) % 360}, 70%, 70%)`,
                  flexShrink: 0
                }}>
                  {customer.name[0]?.toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                    {customer.name}
                    {isInactive && <span style={{ color: 'var(--warning)', marginLeft: 8, fontSize: '0.75rem' }}>⚠️ {daysSince}d ago</span>}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', gap: 12, marginTop: 2 }}>
                    <span>Total: {formatMoney(customer.totalSpent)}</span>
                    {customer.phone && <span>📱 {customer.phone}</span>}
                  </div>
                </div>
                {(customer.totalCredit || 0) > 0 && (
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--danger)', fontWeight: 600, textTransform: 'uppercase' }}>Udhaar</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--danger)' }}>
                      {formatMoney(customer.totalCredit)}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                {(customer.totalCredit || 0) > 0 && (
                  <button
                    className="btn btn-sm btn-success"
                    onClick={() => setPayingId(isPaying ? null : customer.id)}
                    style={{ flex: 1 }}
                  >
                    <CreditCard size={14} /> {isPaying ? 'Cancel' : 'Collect Money'}
                  </button>
                )}
                {isInactive && (
                  <button className="btn btn-sm btn-secondary" style={{ flex: 1 }}>
                    📱 Send Message
                  </button>
                )}
              </div>

              {/* Pay Credit Form */}
              {isPaying && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--glass-border)' }}>
                  <div className="input-group" style={{ marginBottom: 8 }}>
                    <label>Amount Received (₹)</label>
                    <input className="input" type="number" placeholder={`Max: ${Math.round(customer.totalCredit)}`}
                      value={payAmount} onChange={e => setPayAmount(e.target.value)} autoFocus
                      style={{ padding: '10px 12px' }} />
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-success btn-sm btn-full" onClick={() => handlePayCredit(customer)}>
                      ✅ Receive {formatMoney(Number(payAmount) || 0)}
                    </button>
                    <button className="btn btn-sm btn-secondary" onClick={() => {
                      setPayAmount(String(Math.round(customer.totalCredit)));
                    }}>
                      Full
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}

      {/* Add Customer Modal */}
      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-handle"></div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16 }}>
              <UserPlus size={18} style={{ verticalAlign: 'middle', marginRight: 8 }} />
              Add Customer
            </h3>
            <div className="input-group">
              <label>Name</label>
              <input className="input" placeholder="e.g. Sharma Ji" value={newName}
                onChange={e => setNewName(e.target.value)} autoFocus />
            </div>
            <div className="input-group">
              <label>Phone (Optional)</label>
              <input className="input" type="tel" placeholder="e.g. 9876543210" value={newPhone}
                onChange={e => setNewPhone(e.target.value)} />
            </div>
            <button className="btn btn-primary btn-full" onClick={handleAddCustomer}>
              ✅ Add Customer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
