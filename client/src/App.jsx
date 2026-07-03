import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context Providers
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Wardrobe from './pages/Wardrobe';
import OutfitPlanner from './pages/OutfitPlanner';
import AIAssistant from './pages/AIAssistant';
import LaundryTracker from './pages/LaundryTracker';
import ClosetAnalytics from './pages/ClosetAnalytics';
import TravelPlanner from './pages/TravelPlanner';
import Community from './pages/Community';
import Wishlist from './pages/Wishlist';
import AdminPanel from './pages/AdminPanel';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Dashboard Routes */}
              <Route element={<DashboardLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/wardrobe" element={<Wardrobe />} />
                <Route path="/outfit-planner" element={<OutfitPlanner />} />
                <Route path="/ai-stylist" element={<AIAssistant />} />
                <Route path="/laundry" element={<LaundryTracker />} />
                <Route path="/analytics" element={<ClosetAnalytics />} />
                <Route path="/travel" element={<TravelPlanner />} />
                <Route path="/community" element={<Community />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/admin" element={<AdminPanel />} />
              </Route>
            </Routes>
          </Router>
          <ToastContainer theme="colored" />
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
