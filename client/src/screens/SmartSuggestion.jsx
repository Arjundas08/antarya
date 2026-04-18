import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, TrendingUp, Package, Users, DollarSign, 
  RefreshCw, ChevronRight, Lightbulb, CheckCircle2, Sparkles } from 'lucide-react';
import api from '../api';

const SUGGESTION_ICONS = {
  'restock': { icon: '📦', color: 'var(--warning)', bg: 'var(--warning-bg)' },
  'collect_credit': { icon: '💰', color: 'var(--danger)', bg: 'var(--danger-bg)' },
  'inactive_customer': { icon: '👤', color: 'var(--info)', bg: 'var(--info-bg)' },
  'profit': { icon: '📈', color: 'var(--success)', bg: 'var(--success-bg)' },
  'expense': { icon: '💸', color: 'var(--danger)', bg: 'var(--danger-bg)' },
  'growth': { icon: '🚀', color: 'var(--purple-light)', bg: 'var(--purple-glow)' },
  'general': { icon: '💡', color: 'var(--accent-light)', bg: 'var(--accent-glow)' },
};

export default function SmartSuggestion() {
  const navigate = useNavigate();
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState([]);
  const [aiStatus, setAiStatus] = useState(null);

  useEffect(() => {
    loadSuggestions();
    api.getAIStatus().then(setAiStatus).catch(() => {});
  }, []);

  const loadSuggestions = async () => {
    setLoading(true);
    try {
      const data = await api.getSuggestions();
      setSuggestions(data.suggestions || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const dismiss = (index) => {
    setDismissed(prev => [...prev, index]);
  };

  const activeSuggestions = suggestions.filter((_, i) => !dismissed.includes(i));
  const criticalCount = activeSuggestions.filter(s => s.priority === 'high').length;
  const importantCount = activeSuggestions.filter(s => s.priority === 'medium').length;

  if (loading) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner"></div>
          <p style={{ color: 'var(--text-secondary)', marginTop: 14, fontSize: '0.85rem' }}>Analyzing your shop data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 }}>
        <div>
          <h1 className="page-title">Smart Suggestions 🧠</h1>
          <p className="page-subtitle">AI-powered tips to run your shop better</p>
        </div>
        <button className="btn btn-icon" onClick={loadSuggestions} title="Refresh">
          <RefreshCw size={18} />
        </button>
      </div>

      {/* Score Card */}
      <div className="card" style={{ marginBottom: 16, borderColor: criticalCount > 0 ? 'rgba(244,63,94,0.15)' : 'rgba(16,185,129,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 'var(--radius-md)',
            background: criticalCount > 0 
              ? 'linear-gradient(135deg, rgba(244,63,94,0.2), rgba(244,63,94,0.05))'
              : 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(16,185,129,0.05))',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', flexShrink: 0
          }}>
            {criticalCount > 0 ? '⚠️' : activeSuggestions.length > 0 ? '💡' : '🎉'}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.15rem' }}>
              {criticalCount > 0 
                ? `${criticalCount} Critical ${criticalCount === 1 ? 'Issue' : 'Issues'}`
                : activeSuggestions.length > 0
                  ? `${activeSuggestions.length} Suggestions`
                  : 'All Good!'
              }
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 2 }}>
              {criticalCount > 0
                ? 'These need your immediate attention'
                : activeSuggestions.length > 0
                  ? `${importantCount} important, ${activeSuggestions.length - importantCount - criticalCount} tips`
                  : 'No problems detected. Your shop is running smoothly! 🎉'
              }
            </div>
          </div>
        </div>
      </div>

      {/* AI Badge */}
      {aiStatus && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16,
          padding: '8px 14px', borderRadius: 'var(--radius-sm)',
          background: 'var(--glass)', border: '1px solid var(--glass-border)',
          fontSize: '0.75rem', color: 'var(--text-secondary)'
        }}>
          <Sparkles size={12} />
          Powered by {aiStatus.gemini ? 'Gemini AI' : 'Smart Analytics'} •
          <button className="btn btn-ghost" style={{ padding: '2px 8px', fontSize: '0.72rem' }}
            onClick={() => navigate('/ask')}>
            Ask AI anything →
          </button>
        </div>
      )}

      {/* Suggestions List */}
      {activeSuggestions.length === 0 && (
        <div className="empty-state" style={{ marginTop: 20 }}>
          <div className="emoji">🎉</div>
          <h3>All looking good!</h3>
          <p>No problems detected. Your shop is running smoothly.</p>
        </div>
      )}

      {activeSuggestions.map((suggestion, i) => {
        const originalIndex = suggestions.indexOf(suggestion);
        const style = SUGGESTION_ICONS[suggestion.type] || SUGGESTION_ICONS.general;
        const isHigh = suggestion.priority === 'high';
        const isMedium = suggestion.priority === 'medium';

        return (
          <div key={originalIndex} className="card" style={{
            marginBottom: 10,
            borderColor: isHigh ? 'rgba(244,63,94,0.15)' : isMedium ? 'rgba(251,191,36,0.12)' : 'var(--glass-border)',
            animation: `slideUp 0.4s cubic-bezier(0.22,1,0.36,1) ${i * 0.05}s backwards`
          }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              {/* Icon */}
              <div style={{
                width: 42, height: 42, borderRadius: 'var(--radius-sm)', flexShrink: 0,
                background: style.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem'
              }}>
                {style.icon}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                {/* Priority badge */}
                {isHigh && (
                  <span className="badge badge-critical" style={{ marginBottom: 6, display: 'inline-flex' }}>
                    URGENT
                  </span>
                )}
                {isMedium && (
                  <span className="badge badge-low" style={{ marginBottom: 6, display: 'inline-flex' }}>
                    IMPORTANT
                  </span>
                )}

                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.92rem', lineHeight: 1.3, marginBottom: 4 }}>
                  {suggestion.title}
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {suggestion.description}
                </div>

                {/* Action Button */}
                {suggestion.action && (
                  <button className="btn btn-sm" style={{ marginTop: 10,
                    background: isHigh ? 'var(--danger-bg)' : 'var(--glass)',
                    color: isHigh ? 'var(--danger)' : 'var(--text-primary)',
                    border: `1px solid ${isHigh ? 'rgba(244,63,94,0.15)' : 'var(--glass-border)'}`
                  }} onClick={() => {
                    if (suggestion.action.route) navigate(suggestion.action.route);
                  }}>
                    {suggestion.action.label || 'Take Action'} →
                  </button>
                )}
              </div>

              {/* Dismiss */}
              <button onClick={() => dismiss(originalIndex)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4, flexShrink: 0 }}
                title="Dismiss">
                ✕
              </button>
            </div>
          </div>
        );
      })}

      {/* Quick Tips Section */}
      <div className="section-title" style={{ marginTop: 28 }}>💡 Quick Tips</div>

      {[
        { tip: 'Set min stock for each item so you get alerts before they run out', icon: '📦' },
        { tip: 'Record all cash expenses to track your real profit accurately', icon: '💰' },
        { tip: 'Save customer names with sales to build loyalty & udhaar tracking', icon: '👥' },
        { tip: 'Check this page daily — your shop data drives smarter suggestions', icon: '📊' },
      ].map((item, i) => (
        <div key={i} className="list-item" style={{ cursor: 'default' }}>
          <div style={{ fontSize: '1.2rem', width: 36, textAlign: 'center', flexShrink: 0 }}>{item.icon}</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{item.tip}</div>
        </div>
      ))}

      {/* How it Works */}
      <div className="card" style={{ marginTop: 20, borderColor: 'rgba(139,92,246,0.12)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <Sparkles size={16} color="var(--purple-light)" />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.88rem' }}>
            How Smart Suggestions Work
          </span>
        </div>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Antarya analyzes your shop data daily to find:
        </p>
        <ul style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.8, paddingLeft: 20, marginTop: 6 }}>
          <li>Stock levels & reorder timing</li>
          <li>Cash flow & expense patterns</li>
          <li>Customer behavior & inactive alerts</li>
          <li>Sales trends & growth opportunities</li>
        </ul>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 8 }}>
          The more you use the app, the smarter suggestions become! 📈
        </p>
      </div>

      <div style={{ height: 20 }} />
    </div>
  );
}
