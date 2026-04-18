import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useStore } from './context/StoreContext';
import BottomNav from './components/BottomNav';
import Landing from './screens/Landing';
import Onboarding from './screens/Onboarding';
import Dashboard from './screens/Dashboard';
import QuickSale from './screens/QuickSale';
import AddStock from './screens/AddStock';
import MyStock from './screens/MyStock';
import MyMoney from './screens/MyMoney';
import MyCustomers from './screens/MyCustomers';
import SmartSuggestion from './screens/SmartSuggestion';
import AskAnything from './screens/AskAnything';
import GrowShop from './screens/GrowShop';
import Complaints from './screens/Complaints';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useStore();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading your shop...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
}

export default function App() {
  const { isAuthenticated, loading, shop } = useStore();
  const location = useLocation();
  const hideNav = location.pathname === '/' || location.pathname === '/onboarding';

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading ANTARYA...</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Routes>
        <Route
          path="/onboarding"
          element={
            isAuthenticated && shop?.setupComplete
              ? <Navigate to="/dashboard" replace />
              : <Onboarding />
          }
        />
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/sale" element={<ProtectedRoute><QuickSale /></ProtectedRoute>} />
        <Route path="/add-stock" element={<ProtectedRoute><AddStock /></ProtectedRoute>} />
        <Route path="/stock" element={<ProtectedRoute><MyStock /></ProtectedRoute>} />
        <Route path="/money" element={<ProtectedRoute><MyMoney /></ProtectedRoute>} />
        <Route path="/customers" element={<ProtectedRoute><MyCustomers /></ProtectedRoute>} />
        <Route path="/suggestions" element={<ProtectedRoute><SmartSuggestion /></ProtectedRoute>} />
        <Route path="/ask" element={<ProtectedRoute><AskAnything /></ProtectedRoute>} />
        <Route path="/grow" element={<ProtectedRoute><GrowShop /></ProtectedRoute>} />
        <Route path="/complaints" element={<ProtectedRoute><Complaints /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>

      {!hideNav && isAuthenticated && shop?.setupComplete && <BottomNav />}
    </div>
  );
}
