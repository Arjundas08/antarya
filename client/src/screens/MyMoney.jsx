import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { TrendingUp, TrendingDown, Plus, Trash2, ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import api from '../api';

const CATEGORIES = [
  { value: 'Rent', emoji: '🏠', label: 'Rent' },
  { value: 'Electricity', emoji: '💡', label: 'Electricity' },
  { value: 'Water', emoji: '💧', label: 'Water Bill' },
  { value: 'Stock Purchase', emoji: '📦', label: 'Stock Purchase' },
  { value: 'Salary', emoji: '👤', label: 'Salary / Labour' },
  { value: 'Transport', emoji: '🚛', label: 'Transport' },
  { value: 'Phone/Internet', emoji: '📱', label: 'Phone / Internet' },
  { value: 'Maintenance', emoji: '🔧', label: 'Maintenance' },
  { value: 'Tax', emoji: '📋', label: 'Tax / GST' },
  { value: 'General', emoji: '💸', label: 'Other / General' },
];

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

export default function MyMoney() {
  const { showToast } = useStore();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [summary, setSummary] = useState(null);
  const [expenseData, setExpenseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showExpense, setShowExpense] = useState(false);
  const [expandedMonth, setExpandedMonth] = useState(null);

  // Expense form
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('General');
  const [expenseMonth, setExpenseMonth] = useState('');
  const [expenseDate, setExpenseDate] = useState('');

  useEffect(() => {
    // Set default month/date
    const now = new Date();
    setExpenseMonth(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
    setExpenseDate(now.toISOString().split('T')[0]);
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [dash, sum, exp] = await Promise.all([
        api.getDashboard(),
        api.getSalesSummary(),
        api.getExpenses()
      ]);
      setDashboard(dash);
      setSummary(sum);
      setExpenseData(exp);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleAddExpense = async () => {
    if (!expenseDesc || !expenseAmount) {
      showToast('Enter description and amount', 'error');
      return;
    }
    try {
      await api.addExpense({
        description: expenseDesc,
        amount: Number(expenseAmount),
        category: expenseCategory,
        month: expenseMonth,
        date: expenseDate
      });
      showToast(`₹${expenseAmount} expense recorded ✅`);
      setShowExpense(false);
      setExpenseDesc('');
      setExpenseAmount('');
      loadData();
    } catch (err) {
      showToast(err.message || 'Error', 'error');
    }
  };

  const handleDeleteExpense = async (id) => {
    try {
      await api.deleteExpense(id);
      showToast('Expense deleted');
      loadData();
    } catch (err) {
      showToast('Could not delete', 'error');
    }
  };

  const formatMoney = (amount) => `₹${Math.round(amount).toLocaleString('en-IN')}`;

  const formatMonthLabel = (monthStr) => {
    const [year, month] = monthStr.split('-');
    return `${MONTH_NAMES[parseInt(month) - 1]} ${year}`;
  };

  const getCategoryEmoji = (cat) => {
    const found = CATEGORIES.find(c => c.value === cat);
    return found?.emoji || '💸';
  };

  // Generate month options (last 12 months)
  const getMonthOptions = () => {
    const options = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
      options.push({ value: val, label });
    }
    return options;
  };

  if (loading || !dashboard) {
    return <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div className="spinner"></div>
    </div>;
  }

  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 className="page-title">My Money 💵</h1>
          <p className="page-subtitle">Financial overview & expense tracking</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowExpense(!showExpense)}>
          <Plus size={14} /> Add Expense
        </button>
      </div>

      {/* Cash in Hand Hero */}
      <div className="hero-card" style={{ marginBottom: 14 }}>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
          💰 Cash in Hand
        </div>
        <div style={{
          fontFamily: 'var(--font-display)', fontSize: '2.6rem', fontWeight: 900,
          color: dashboard.cashInHand >= 0 ? 'var(--success)' : 'var(--danger)',
          lineHeight: 1, marginTop: 8, letterSpacing: -1
        }}>
          {formatMoney(dashboard.cashInHand)}
        </div>
        {dashboard.cashRunway !== 999 && (
          <div className={`profit-pill ${dashboard.cashRunway < 15 ? 'negative' : 'positive'}`} style={{ marginTop: 10 }}>
            {dashboard.cashRunway < 15 ? '⚠️' : '✅'} ~{dashboard.cashRunway} days left
          </div>
        )}
      </div>

      {/* This Month Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">📈 Sales</div>
          <div className="stat-value" style={{ color: 'var(--success)' }}>{formatMoney(dashboard.monthSales)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">📉 Expenses</div>
          <div className="stat-value" style={{ color: 'var(--danger)' }}>{formatMoney(dashboard.monthExpenses)}</div>
        </div>
        <div className="stat-card highlight">
          <div className="stat-label">💰 Profit</div>
          <div className="stat-value" style={{ color: dashboard.monthProfit >= 0 ? 'var(--success)' : 'var(--danger)' }}>
            {formatMoney(dashboard.monthProfit)}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">📋 Udhaar</div>
          <div className="stat-value" style={{ color: 'var(--warning)' }}>{formatMoney(dashboard.totalCredit)}</div>
        </div>
      </div>

      {/* Add Expense Form */}
      {showExpense && (
        <div className="card" style={{ marginBottom: 16, borderColor: 'rgba(244,63,94,0.15)' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            💸 Record Expense
          </h3>

          {/* Description */}
          <div className="input-group">
            <label>What was it for?</label>
            <input className="input" placeholder="e.g. Shop Rent, Electricity Bill"
              value={expenseDesc} onChange={e => setExpenseDesc(e.target.value)} autoFocus />
          </div>

          {/* Amount + Category */}
          <div className="input-row">
            <div className="input-group">
              <label>Amount (₹)</label>
              <input className="input" type="number" placeholder="e.g. 5000"
                value={expenseAmount} onChange={e => setExpenseAmount(e.target.value)} />
            </div>
            <div className="input-group">
              <label>Category</label>
              <select className="input" value={expenseCategory} onChange={e => setExpenseCategory(e.target.value)}>
                {CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Month + Date */}
          <div className="input-row">
            <div className="input-group">
              <label>📅 Month</label>
              <select className="input" value={expenseMonth} onChange={e => setExpenseMonth(e.target.value)}>
                {getMonthOptions().map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
            <div className="input-group">
              <label>📆 Date</label>
              <input className="input" type="date" value={expenseDate}
                onChange={e => setExpenseDate(e.target.value)} />
            </div>
          </div>

          {/* Quick Category Buttons */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
            {CATEGORIES.slice(0, 6).map(c => (
              <button key={c.value}
                className={`btn btn-sm ${expenseCategory === c.value ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => { setExpenseCategory(c.value); if (!expenseDesc) setExpenseDesc(c.label); }}
                style={{ fontSize: '0.72rem', padding: '5px 10px' }}>
                {c.emoji} {c.value}
              </button>
            ))}
          </div>

          <button className="btn btn-danger btn-full btn-lg" onClick={handleAddExpense}
            disabled={!expenseDesc || !expenseAmount}>
            💸 Record ₹{expenseAmount || '0'} Expense
          </button>
        </div>
      )}

      {/* Category Breakdown (Current Month) */}
      {expenseData?.categoryTotals && Object.keys(expenseData.categoryTotals).length > 0 && (
        <>
          <div className="section-title">📊 This Month's Expenses by Category</div>
          <div className="card">
            {Object.entries(expenseData.categoryTotals)
              .sort((a, b) => b[1] - a[1])
              .map(([cat, total]) => {
                const maxTotal = Math.max(...Object.values(expenseData.categoryTotals));
                const pct = maxTotal > 0 ? (total / maxTotal) * 100 : 0;
                return (
                  <div key={cat} style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                        {getCategoryEmoji(cat)} {cat}
                      </span>
                      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--danger)' }}>
                        {formatMoney(total)}
                      </span>
                    </div>
                    <div style={{ height: 6, background: 'var(--glass)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', width: `${pct}%`, borderRadius: 4,
                        background: 'linear-gradient(90deg, var(--danger), var(--accent))',
                        transition: 'width 0.6s ease'
                      }} />
                    </div>
                  </div>
                );
              })}
          </div>
        </>
      )}

      {/* Weekly Sales Chart */}
      {summary?.dailyBreakdown && (
        <>
          <div className="section-title">📈 Weekly Sales Trend</div>
          <div className="card">
            <div className="bar-chart" style={{ height: 130 }}>
              {summary.dailyBreakdown.map((day, i) => {
                const maxVal = Math.max(...summary.dailyBreakdown.map(d => d.total), 1);
                const heightPct = (day.total / maxVal) * 100;
                const isToday = i === summary.dailyBreakdown.length - 1;
                return (
                  <div className="bar-col" key={i}>
                    <div className="bar-value">{day.total > 0 ? `₹${Math.round(day.total)}` : '-'}</div>
                    <div className="bar" style={{
                      height: `${Math.max(heightPct, 4)}%`,
                      background: isToday ? 'linear-gradient(180deg, var(--accent), var(--accent-dark))' : undefined
                    }} />
                    <div className="bar-label" style={{ color: isToday ? 'var(--accent)' : undefined, fontWeight: isToday ? 800 : undefined }}>
                      {day.day}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Quick Stats */}
      <div className="section-title">⚡ Quick Stats</div>
      <div className="card">
        {[
          { label: "Today's Sales", value: formatMoney(dashboard.todaySales), color: 'var(--success)' },
          { label: "Yesterday's Sales", value: formatMoney(dashboard.yesterdaySales) },
          { label: 'Daily Average (30d)', value: formatMoney(dashboard.dailyAverage) },
          { label: 'Today vs Yesterday', value: dashboard.yesterdaySales > 0
            ? `${Math.round(((dashboard.todaySales - dashboard.yesterdaySales) / dashboard.yesterdaySales) * 100)}%`
            : '—',
            color: dashboard.todaySales >= dashboard.yesterdaySales ? 'var(--success)' : 'var(--danger)',
            icon: dashboard.todaySales >= dashboard.yesterdaySales ? <TrendingUp size={14} /> : <TrendingDown size={14} />
          },
        ].map((row, i) => (
          <div key={i} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '10px 0', borderBottom: i < 3 ? '1px solid var(--glass-border)' : 'none'
          }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>{row.label}</span>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: row.color, display: 'flex', alignItems: 'center', gap: 4 }}>
              {row.icon} {row.value}
            </span>
          </div>
        ))}
      </div>

      {/* Expense History by Month */}
      {expenseData?.byMonth && expenseData.byMonth.length > 0 && (
        <>
          <div className="section-title">📋 Expense History</div>
          {expenseData.byMonth.map((monthGroup) => {
            const isExpanded = expandedMonth === monthGroup.month;
            return (
              <div key={monthGroup.month} className="card" style={{ marginBottom: 8, padding: 0, overflow: 'hidden' }}>
                {/* Month Header */}
                <div onClick={() => setExpandedMonth(isExpanded ? null : monthGroup.month)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 16px', cursor: 'pointer',
                    background: isExpanded ? 'rgba(255,255,255,0.03)' : 'transparent'
                  }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Calendar size={16} color="var(--accent)" />
                    <div>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.92rem' }}>
                        {formatMonthLabel(monthGroup.month)}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {monthGroup.expenses.length} expense{monthGroup.expenses.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--danger)', fontSize: '1rem' }}>
                      {formatMoney(monthGroup.total)}
                    </span>
                    {isExpanded ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
                  </div>
                </div>

                {/* Expanded Expenses */}
                {isExpanded && (
                  <div style={{ borderTop: '1px solid var(--glass-border)' }}>
                    {monthGroup.expenses.map(exp => (
                      <div key={exp.id} style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.03)',
                        transition: 'background 0.2s'
                      }}>
                        <div style={{ fontSize: '1.2rem', width: 32, textAlign: 'center', flexShrink: 0 }}>
                          {getCategoryEmoji(exp.category)}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.88rem',
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {exp.description}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>
                            {exp.category} • {exp.date || new Date(exp.createdAt).toLocaleDateString('en-IN')}
                          </div>
                        </div>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--danger)', fontSize: '0.95rem', flexShrink: 0 }}>
                          -₹{Math.round(exp.amount).toLocaleString('en-IN')}
                        </div>
                        <button onClick={() => handleDeleteExpense(exp.id)}
                          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4, flexShrink: 0 }}
                          title="Delete expense">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </>
      )}

      {/* No Expenses */}
      {(!expenseData?.byMonth || expenseData.byMonth.length === 0) && (
        <div className="empty-state" style={{ marginTop: 20 }}>
          <div className="emoji">💸</div>
          <h3>No expenses recorded yet</h3>
          <p>Track your rent, bills, and costs to see real profit</p>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowExpense(true)} style={{ marginTop: 12 }}>
            <Plus size={14} /> Add First Expense
          </button>
        </div>
      )}

      <div style={{ height: 20 }} />
    </div>
  );
}
