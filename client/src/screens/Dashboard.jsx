import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { ChevronRight, ArrowRight, Zap, PlusCircle, Users, Brain, TrendingUp } from 'lucide-react';
import api from '../api';

export default function Dashboard() {
  const { shop } = useStore();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [salesSummary, setSalesSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [dashboard, summary] = await Promise.all([
        api.getDashboard(),
        api.getSalesSummary()
      ]);
      setData(dashboard);
      setSalesSummary(summary);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  if (loading || !data) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="spinner" style={{ width: 36, height: 36 }}></div>
      </div>
    );
  }

  const formatMoney = (amount) => {
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
    return `₹${Math.round(amount).toLocaleString('en-IN')}`;
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  // FinTech Card Gradient
  const cardGradient = data.cashInHand >= 0 
    ? 'linear-gradient(135deg, rgba(16,185,129,0.3) 0%, rgba(6,78,59,0.8) 100%)' 
    : 'linear-gradient(135deg, rgba(225,29,72,0.3) 0%, rgba(136,19,55,0.8) 100%)';

  return (
    <div className="page" style={{ paddingBottom: 80, paddingTop: 16 }}>
      {/* Premium Header */}
      <div className="animate-in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500, letterSpacing: '0.5px' }}>
            {greeting},
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800, color: 'white', letterSpacing: '-0.5px' }}>
            {data.ownerName || data.shopName}
          </div>
        </div>
        <div style={{ 
          width: 44, height: 44, borderRadius: '50%', background: 'var(--glass)', 
          border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(10px)', fontSize: '1.2rem', color: 'white'
        }} onClick={() => navigate('/customers')}>
          👤
        </div>
      </div>

      {/* Ultra-Premium Edge-to-Edge Hero Card */}
      <div className="animate-in stagger-1" onClick={() => navigate('/money')} style={{
        background: '#0f172a',
        borderRadius: '1.5rem',
        padding: '1.5rem',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.2)',
        border: '1px solid rgba(255,255,255,0.05)',
        cursor: 'pointer',
        marginBottom: 28
      }}>
        <div style={{ position: 'absolute', inset: 0, background: cardGradient, opacity: 0.6, zIndex: 0 }} />
        <div style={{ position: 'absolute', right: -20, top: -20, width: 150, height: 150, background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)', filter: 'blur(20px)', zIndex: 1 }} />
        
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>Available Balance</span>
            {data.cashInHand < 0 && <span style={{ padding: '2px 6px', background: 'var(--danger)', borderRadius: 10, fontSize: '0.65rem', color: 'white' }}>Negative</span>}
          </div>
          
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', fontWeight: 900, color: 'white', letterSpacing: '-1.5px', marginTop: 4, lineHeight: 1.1 }}>
            {formatMoney(data.cashInHand)}
          </div>
          
          <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '6px 12px', borderRadius: 20, fontSize: '0.75rem', color: 'white', display: 'flex', alignItems: 'center', gap: 4, backdropFilter: 'blur(4px)' }}>
              <TrendingUp size={14} color="#34d399" /> +{formatMoney(data.monthProfit)} Mo. Profit
            </div>
          </div>

          <div style={{ 
            display: 'flex', justifyContent: 'space-between', 
            marginTop: 24, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.15)' 
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Today's Sales</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'white', marginTop: 2 }}>{formatMoney(data.todaySales)}</div>
            </div>
            <div style={{ width: 1, background: 'rgba(255,255,255,0.15)', margin: '0 16px' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Transactions</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'white', marginTop: 2 }}>{data.todayTransactions}</div>
            </div>
          </div>
        </div>
      </div>

      {/* iOS Style Action Grid */}
      <div className="animate-in stagger-2" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 16,
        marginBottom: 28
      }}>
        {[
          { label: 'Sale', icon: <Zap size={24} />, color: '#10b981', path: '/sale', bg: 'rgba(16,185,129,0.15)' },
          { label: 'Stock', icon: <PlusCircle size={24} />, color: '#3b82f6', path: '/add-stock', bg: 'rgba(59,130,246,0.15)' },
          { label: 'Udhaar', icon: <Users size={24} />, color: '#f59e0b', path: '/customers', bg: 'rgba(245,158,11,0.15)' },
          { label: 'AI AI', icon: <Brain size={24} />, color: '#a855f7', path: '/grow', bg: 'rgba(168,85,247,0.15)' },
        ].map((action, i) => (
          <div key={i} onClick={() => navigate(action.path)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <div style={{
              width: 56, height: 56, borderRadius: '1.2rem', background: action.bg, color: action.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `inset 0 2px 4px rgba(255,255,255,0.1), 0 8px 16px -4px ${action.bg}`,
              border: `1px solid rgba(255,255,255,0.05)`,
              transition: 'transform 0.2s ease'
            }} className="hover-scale">
              {action.icon}
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.3px' }}>{action.label}</span>
          </div>
        ))}
      </div>

      {/* Critical Alerts Consolidation */}
      <div className="animate-in stagger-3" style={{ marginBottom: 28 }}>
        {data.cashRunway !== 999 && data.cashRunway < 20 && (
          <div style={{ background: 'rgba(225,29,72,0.1)', border: '1px solid rgba(225,29,72,0.2)', padding: 16, borderRadius: '1rem', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }} onClick={() => navigate('/grow')}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(225,29,72,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>⚠️</div>
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#f43f5e', fontWeight: 700 }}>Critical Cashflow</h4>
              <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Only ~{data.cashRunway} days of cash left. Ask Finance AI.</p>
            </div>
            <ArrowRight size={16} color="#f43f5e" />
          </div>
        )}
        
        {data.lowStockItems.length > 0 && (
          <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', padding: 16, borderRadius: '1rem', display: 'flex', alignItems: 'center', gap: 12 }} onClick={() => navigate('/stock')}>
             <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>📦</div>
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#fbbf24', fontWeight: 700 }}>{data.lowStockItems.length} items low on stock</h4>
              <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Include {data.lowStockItems[0]?.name}</p>
            </div>
            <ArrowRight size={16} color="#fbbf24" />
          </div>
        )}
      </div>

      {/* Stripe-style Glowing Bar Chart */}
      {salesSummary?.dailyBreakdown && (
        <div className="animate-in stagger-4" style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'white' }}>Revenue Timeline</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Last 7 Days</span>
          </div>
          
          <div style={{ 
            background: 'var(--glass)', border: '1px solid var(--glass-border)', borderRadius: '1.2rem', padding: '1.5rem',
            height: 200, display: 'flex', alignItems: 'flex-end', gap: 8, justifyContent: 'space-between', position: 'relative'
          }}>
            {/* Guide lines */}
            <div style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', right: '1.5rem', borderBottom: '1px dashed rgba(255,255,255,0.05)' }}></div>
            <div style={{ position: 'absolute', top: '50%', left: '1.5rem', right: '1.5rem', borderBottom: '1px dashed rgba(255,255,255,0.05)' }}></div>

            {salesSummary.dailyBreakdown.map((day, i) => {
              const maxVal = Math.max(...salesSummary.dailyBreakdown.map(d => d.total), 1);
              const heightPct = Math.max((day.total / maxVal) * 100, 4); // min 4% to show bar
              const isToday = i === salesSummary.dailyBreakdown.length - 1;
              
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, zIndex: 1, height: '100%', justifyContent: 'flex-end' }}>
                  <div style={{ 
                    fontSize: '0.65rem', color: isToday ? 'white' : 'var(--text-muted)', marginBottom: 6, fontWeight: isToday ? 700 : 500,
                    opacity: day.total > 0 ? 1 : 0, transition: 'opacity 0.2s'
                  }}>
                    {day.total >= 1000 ? `${(day.total/1000).toFixed(1)}k` : day.total}
                  </div>
                  
                  <div style={{
                    width: '100%',
                    maxWidth: 32,
                    height: `${heightPct}%`,
                    borderRadius: '6px',
                    background: isToday ? 'linear-gradient(180deg, #34d399 0%, #059669 100%)' : 'rgba(255,255,255,0.1)',
                    boxShadow: isToday ? '0 0 15px rgba(16,185,129,0.3)' : 'none',
                    transition: 'height 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                  }} />
                  
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 8, fontWeight: 500 }}>
                    {day.day}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Top Customers Mini-List */}
      {data.topCustomers?.length > 0 && (
        <div className="animate-in stagger-5">
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'white' }}>Loyal Customers</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }} onClick={() => navigate('/customers')}>View All</span>
          </div>
          
          <div style={{ background: 'var(--glass)', border: '1px solid var(--glass-border)', borderRadius: '1.2rem', padding: '0.5rem' }}>
            {data.topCustomers.slice(0, 3).map((customer, i) => (
              <div key={customer.id} onClick={() => navigate('/customers')} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px', borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none', cursor: 'pointer'
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%', background: `hsla(${i * 45 + 150}, 80%, 60%, 0.15)`, 
                  color: `hsl(${i * 45 + 150}, 80%, 70%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem'
                }}>
                  {customer.name.substring(0, 2).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'white' }}>{customer.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{formatMoney(customer.totalSpent)} lifetime</div>
                </div>
                {customer.totalCredit > 0 && (
                  <div style={{ background: 'rgba(245,158,11,0.1)', padding: '4px 8px', borderRadius: 6, fontSize: '0.7rem', color: '#fbbf24', fontWeight: 600 }}>
                    ₹{Math.round(customer.totalCredit)} Due
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
