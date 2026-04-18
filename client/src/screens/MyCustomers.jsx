import { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { Search, Plus, UserPlus, Phone, CreditCard, ArrowLeft, ArrowRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function MyCustomers() {
  const { showToast } = useStore();
  const navigate = useNavigate();
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
    if (!newName) { showToast('Customer name required', 'error'); return; }
    try {
      await api.addCustomer({ name: newName, phone: newPhone });
      showToast(`${newName} added!`);
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
      showToast(`₹${amount} collected from ${customer.name}`);
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
    if (filter === 'recent') {
      const days = getDaysSince(c.lastVisit);
      return days !== null && days <= 5;
    }
    if (filter === 'inactive') {
      const days = getDaysSince(c.lastVisit);
      return days !== null && days >= 10;
    }
    return true;
  }).sort((a,b) => {
    if (filter === 'credit') return (b.totalCredit || 0) - (a.totalCredit || 0);
    if (filter === 'recent' || filter === 'all') return new Date(b.lastVisit || 0) - new Date(a.lastVisit || 0);
    return 0; // maintain original sort otherwise
  });

  const totalCredit = customers.reduce((s, c) => s + (c.totalCredit || 0), 0);
  const creditCustomers = customers.filter(c => (c.totalCredit || 0) > 0).length;

  if (loading) return <div className="page" style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}><div className="spinner"></div></div>;

  return (
    <div className="page" style={{ paddingTop: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn btn-ghost" onClick={() => navigate('/dashboard')} style={{ padding: 8, width: 40, height: 40, borderRadius: '50%', background: 'var(--glass)' }}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="page-title" style={{ fontSize: '1.4rem', marginBottom: 2 }}>CRM</h1>
            <p className="page-subtitle" style={{ fontSize: '0.8rem' }}>{customers.length} Customers</p>
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)} style={{ padding: '8px 16px', borderRadius: '2rem' }}>
          <UserPlus size={18} style={{ marginRight: 4 }}/> Add
        </button>
      </div>

      {/* Hero Credit Alert */}
      {totalCredit > 0 && (
        <div className="animate-in" style={{ background: 'linear-gradient(135deg, rgba(244,63,94,0.15) 0%, rgba(159,18,57,0.1) 100%)', border: '1px solid rgba(244,63,94,0.2)', padding: '1.2rem', borderRadius: '1.5rem', marginBottom: 24 }}>
          <div style={{ fontSize: '0.75rem', color: '#f43f5e', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <CreditCard size={14} /> Outstanding Udhaar
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', fontWeight: 900, color: '#f43f5e', letterSpacing: '-1px' }}>
            {formatMoney(totalCredit)}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4 }}>
            Pending from {creditCustomers} loyal customers
          </div>
        </div>
      )}

      {/* Modern Search */}
      <div style={{ 
        display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.03)', 
        border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', padding: '0 16px', marginBottom: 20,
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
      }}>
        <Search size={20} color="var(--text-muted)" />
        <input
          type="text"
          placeholder="Search phone or name..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ 
            flex: 1, background: 'transparent', border: 'none', color: 'white', 
            padding: '16px 12px', fontSize: '0.95rem', outline: 'none' 
          }}
        />
        {searchTerm && <X size={18} color="var(--text-muted)" onClick={() => setSearchTerm('')} style={{cursor: 'pointer'}} />}
      </div>

      {/* Pill Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
        {[
          { id: 'all', label: 'All Users' },
          { id: 'recent', label: 'Recent Buyers' },
          { id: 'credit', label: 'Has Udhaar' },
          { id: 'inactive', label: 'Inactive' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            style={{
              padding: '8px 16px',
              borderRadius: '2rem',
              whiteSpace: 'nowrap',
              fontSize: '0.85rem',
              fontWeight: 600,
              background: filter === tab.id ? 'white' : 'transparent',
              color: filter === tab.id ? 'black' : 'var(--text-secondary)',
              border: filter === tab.id ? '1px solid white' : '1px solid rgba(255,255,255,0.2)',
              transition: 'all 0.2s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Data List */}
      {filtered.length === 0 ? (
        <div className="empty-state" style={{ padding: '40px 20px' }}>
          <UserPlus size={48} color="var(--glass-border)" style={{ marginBottom: 16 }} />
          <h3>No customers found</h3>
          <p style={{ color: 'var(--text-secondary)' }}>They will be added automatically when you make a sale.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map((customer, i) => {
            const daysSince = getDaysSince(customer.lastVisit);
            const isInactive = daysSince !== null && daysSince >= 10;
            const isPaying = payingId === customer.id;
            const hasCredit = (customer.totalCredit || 0) > 0;

            return (
              <div key={customer.id} className="animate-in" style={{ 
                animationDelay: `${i * 0.05}s`,
                background: 'var(--bg-card)', 
                border: '1px solid var(--glass-border)',
                borderRadius: '1rem',
                padding: '16px',
                position: 'relative'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  {/* Avatar */}
                  <div style={{
                    width: 48, height: 48, borderRadius: '50%',
                    background: `hsla(${(i * 45) % 360}, 80%, 60%, 0.15)`, 
                    color: `hsl(${(i * 45) % 360}, 80%, 70%)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 700,
                    border: '1px solid rgba(255,255,255,0.05)'
                  }}>
                    {customer.name[0]?.toUpperCase()}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontWeight: 600, fontSize: '1.05rem', color: 'white' }}>{customer.name}</span>
                      {isInactive && <span style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24', padding: '2px 8px', borderRadius: '1rem', fontSize: '0.65rem', fontWeight: 700 }}>{daysSince}d AWAY</span>}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span>Lifetime: {formatMoney(customer.totalSpent)}</span>
                      {customer.phone && <> <div style={{width:4,height:4,borderRadius:'50%',background:'rgba(255,255,255,0.2)'}}/> <span>📱 {customer.phone}</span> </>}
                    </div>
                  </div>

                  {hasCredit ? (
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f43f5e' }}>{formatMoney(customer.totalCredit)}</div>
                      <div style={{ fontSize: '0.65rem', color: '#f43f5e', textTransform: 'uppercase', fontWeight: 700, opacity: 0.8 }}>Pending</div>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'right' }}>
                       <div style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700 }}>PAID</div>
                    </div>
                  )}
                </div>

                {/* Actions Inline */}
                <div style={{ display: 'flex', gap: 8, marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--glass-border)' }}>
                    {hasCredit && (
                      <button className="btn btn-sm" style={{ flex: 1, background: 'rgba(225,29,72,0.1)', color: '#f43f5e', border: '1px solid rgba(225,29,72,0.2)' }} onClick={() => setPayingId(isPaying ? null : customer.id)}>
                        {isPaying ? 'Cancel' : 'Collect Udhaar'}
                      </button>
                    )}
                    {isInactive && (
                      <button className="btn btn-sm btn-secondary" style={{ flex: 1 }} onClick={() => navigate('/grow')}>
                        Ask Marketing AI
                      </button>
                    )}
                </div>

                {/* Secure Payment Dropdown */}
                {isPaying && (
                  <div style={{ marginTop: 16, background: 'rgba(0,0,0,0.2)', padding: 16, borderRadius: '0.8rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 8 }}>Amount Received (₹)</div>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <input 
                        type="number" className="input" 
                        value={payAmount} onChange={e => setPayAmount(e.target.value)} 
                        autoFocus
                        style={{ flex: 1, padding: '12px', fontSize: '1rem' }} 
                        placeholder={`(Max ${Math.round(customer.totalCredit)})`} 
                      />
                      <button className="btn btn-secondary" onClick={() => setPayAmount(String(Math.round(customer.totalCredit)))}>Full</button>
                    </div>
                    <button className="btn" style={{ background: '#10b981', color: 'white', width: '100%', marginTop: 12, padding: 12, fontWeight: 700 }} onClick={() => handlePayCredit(customer)}>
                      Confirm Payment
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Customer Modal Overlay */}
      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div className="animate-in" style={{ background: '#0f172a', width: '100%', maxWidth: 400, borderRadius: '24px 24px 0 0', padding: 24, paddingBottom: 40, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'white', margin: 0 }}>Add Customer</h3>
              <button onClick={() => setShowAdd(false)} style={{ background: 'var(--glass)', border: 'none', color: 'var(--text-muted)', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={16} />
              </button>
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 6, display: 'block', fontWeight: 500 }}>Customer Name</label>
              <input className="input" placeholder="e.g. Ramesh Singh" value={newName} onChange={e => setNewName(e.target.value)} autoFocus style={{ padding: '14px', fontSize: '1rem', background: 'rgba(255,255,255,0.05)' }} />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 6, display: 'block', fontWeight: 500 }}>Phone (Optional)</label>
              <input className="input" type="tel" placeholder="e.g. 9876543210" value={newPhone} onChange={e => setNewPhone(e.target.value)} style={{ padding: '14px', fontSize: '1rem', background: 'rgba(255,255,255,0.05)' }} />
            </div>
            <button className="btn btn-primary" style={{ width: '100%', padding: '16px', fontSize: '1rem', fontWeight: 700, borderRadius: '1rem' }} onClick={handleAddCustomer}>
              Save Customer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
