import { useLocation, useNavigate } from 'react-router-dom';
import { Home, ShoppingBag, Package, Wallet, Menu, Mic, X } from 'lucide-react';
import { useState } from 'react';

const mainTabs = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/stock', icon: Package, label: 'Stock' },
  { path: '/sale', icon: null, label: 'Sale' },  // Center floating button
  { path: '/money', icon: Wallet, label: 'Money' },
  { path: '/more', icon: Menu, label: 'More' },
];

const moreItems = [
  { path: '/customers', emoji: '👥', label: 'My Customers' },
  { path: '/suggestions', emoji: '🧠', label: 'Smart Suggestions' },
  { path: '/ask', emoji: '🤖', label: 'Ask Anything' },
  { path: '/grow', emoji: '📢', label: 'Grow My Shop' },
  { path: '/complaints', emoji: '🆘', label: 'Complaints' },
  { path: '/add-stock', emoji: '📦', label: 'Add Stock' },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showMore, setShowMore] = useState(false);

  const handleNav = (path) => {
    if (path === '/more') {
      setShowMore(!showMore);
      return;
    }
    setShowMore(false);
    navigate(path);
  };

  return (
    <>
      {/* More Menu Overlay */}
      {showMore && (
        <div className="modal-overlay" onClick={() => setShowMore(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-handle"></div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16 }}>More Options</h3>
            {moreItems.map(item => (
              <div
                key={item.path}
                className="list-item"
                onClick={() => { navigate(item.path); setShowMore(false); }}
              >
                <div className="list-item-icon">{item.emoji}</div>
                <div className="list-item-content">
                  <div className="list-item-title">{item.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar */}
      <nav className="bottom-nav">
        {mainTabs.map(tab => {
          if (tab.path === '/sale') {
            return (
              <button
                key={tab.path}
                className="nav-sale-btn"
                onClick={() => handleNav(tab.path)}
                id="nav-sale"
              >
                <Mic />
              </button>
            );
          }

          const Icon = tab.icon;
          const isActive = tab.path === '/more'
            ? showMore
            : location.pathname === tab.path;

          return (
            <button
              key={tab.path}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => handleNav(tab.path)}
              id={`nav-${tab.label.toLowerCase()}`}
            >
              <Icon />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
