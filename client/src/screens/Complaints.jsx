import { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { MessageCircle, Send, Check, Clock, AlertCircle } from 'lucide-react';

export default function Complaints() {
  const { showToast } = useStore();

  const [complaints, setComplaints] = useState([
    {
      id: 1,
      customer: 'Sharma Ji',
      issue: 'Oil packet was leaking',
      date: '2 hours ago',
      status: 'open',
      suggestedReply: 'Sorry Sharma ji 🙏 New packet kept aside for you. No extra charge. Please come collect anytime.',
      priority: 'high'
    },
    {
      id: 2,
      customer: 'New Customer',
      issue: 'Price seems too high for sugar',
      date: 'Yesterday',
      status: 'open',
      suggestedReply: 'Our prices match the market rate. But specially for you - 5% off on your next purchase! 😊',
      priority: 'medium'
    },
    {
      id: 3,
      customer: 'Priya Madam',
      issue: 'Bread was expired',
      date: '3 days ago',
      status: 'resolved',
      suggestedReply: 'Very sorry Priya ji. Fresh bread delivered to your house. We will check dates more carefully. 🙏',
      priority: 'high'
    }
  ]);

  const [customReply, setCustomReply] = useState('');
  const [replyingId, setReplyingId] = useState(null);

  const handleResolve = (id, reply) => {
    setComplaints(prev => prev.map(c =>
      c.id === id ? { ...c, status: 'resolved' } : c
    ));
    showToast(`Reply sent & issue resolved! ✅`);
    setReplyingId(null);
    setCustomReply('');
  };

  const openComplaints = complaints.filter(c => c.status === 'open');
  const resolvedComplaints = complaints.filter(c => c.status === 'resolved');

  return (
    <div className="page">
      <h1 className="page-title">Complaints 🆘</h1>
      <p className="page-subtitle">Manage customer issues quickly</p>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: 16 }}>
        <div className="stat-card" style={{ borderColor: openComplaints.length > 0 ? 'rgba(239, 68, 68, 0.3)' : 'var(--glass-border)' }}>
          <div className="stat-label">🔴 Open</div>
          <div className="stat-value" style={{ color: openComplaints.length > 0 ? 'var(--danger)' : 'var(--success)' }}>
            {openComplaints.length}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">✅ Resolved</div>
          <div className="stat-value" style={{ color: 'var(--success)' }}>{resolvedComplaints.length}</div>
        </div>
      </div>

      {/* Open Issues */}
      {openComplaints.length > 0 && (
        <>
          <div className="section-title">🔴 Open Issues</div>
          {openComplaints.map(complaint => (
            <div className="card" key={complaint.id} style={{
              borderColor: complaint.priority === 'high' ? 'rgba(239, 68, 68, 0.2)' : 'var(--glass-border)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 'var(--radius-full)',
                  background: complaint.priority === 'high' ? 'var(--danger-bg)' : 'var(--warning-bg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <AlertCircle size={18} color={complaint.priority === 'high' ? 'var(--danger)' : 'var(--warning)'} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{complaint.customer}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={12} /> {complaint.date}
                  </div>
                </div>
                <span className={`badge ${complaint.priority === 'high' ? 'badge-critical' : 'badge-low'}`}>
                  {complaint.priority}
                </span>
              </div>

              <div style={{
                padding: 12,
                background: 'var(--glass)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.9rem',
                marginBottom: 12,
                borderLeft: '3px solid var(--danger)'
              }}>
                "{complaint.issue}"
              </div>

              {/* Suggested Reply */}
              <div style={{
                padding: 12,
                background: 'var(--success-bg)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.85rem',
                marginBottom: 12,
                borderLeft: '3px solid var(--success)'
              }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--success)', marginBottom: 4, textTransform: 'uppercase' }}>
                  🤖 Suggested Reply:
                </div>
                {complaint.suggestedReply}
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  className="btn btn-success btn-sm"
                  onClick={() => handleResolve(complaint.id, complaint.suggestedReply)}
                  style={{ flex: 1 }}
                >
                  <Send size={14} /> Quick Reply & Resolve
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setReplyingId(replyingId === complaint.id ? null : complaint.id)}
                >
                  ✏️ Custom
                </button>
              </div>

              {/* Custom Reply */}
              {replyingId === complaint.id && (
                <div style={{ marginTop: 12 }}>
                  <textarea
                    className="input"
                    placeholder="Type your custom reply..."
                    value={customReply}
                    onChange={e => setCustomReply(e.target.value)}
                    rows={3}
                    style={{ resize: 'none' }}
                  />
                  <button
                    className="btn btn-primary btn-sm btn-full"
                    onClick={() => handleResolve(complaint.id, customReply)}
                    style={{ marginTop: 8 }}
                    disabled={!customReply.trim()}
                  >
                    <Send size={14} /> Send & Resolve
                  </button>
                </div>
              )}
            </div>
          ))}
        </>
      )}

      {/* Resolved */}
      {resolvedComplaints.length > 0 && (
        <>
          <div className="section-title">✅ Resolved</div>
          {resolvedComplaints.map(complaint => (
            <div className="card" key={complaint.id} style={{ opacity: 0.6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Check size={20} color="var(--success)" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{complaint.customer}: "{complaint.issue}"</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    Resolved • {complaint.date}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </>
      )}

      {/* Empty State */}
      {complaints.length === 0 && (
        <div className="empty-state">
          <div className="emoji">🎉</div>
          <h3>No Complaints!</h3>
          <p>All your customers are happy. Keep up the great work!</p>
        </div>
      )}

      {/* Tips */}
      <div className="card" style={{ marginTop: 20 }}>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 8 }}>💡 Customer Service Tips</h3>
        <ul style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.8, paddingLeft: 16 }}>
          <li>Always apologize first, even if it's not your fault</li>
          <li>Replace defective items immediately - it builds loyalty</li>
          <li>A small discount on next purchase turns angry customers into regulars</li>
          <li>Respond within 30 minutes for best results</li>
        </ul>
      </div>
    </div>
  );
}
