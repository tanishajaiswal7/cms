import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import "./App.css";

import Register from "./pages/Register/Register";
import Login from "./pages/Login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import AdminPanel from "./pages/AdminPanel/AdminPanel";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import Complaints from "./pages/Complaints/Complaints";
import AdminProviders from "./pages/AdminProviders/AdminProviders";
import AdminHome from "./pages/AdminHome/AdminHome";
import AdminAnalytics from "./pages/AdminAnalytics/AdminAnalytics";
import Profile from "./pages/Profile/Profile";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";
import AdminRentManagement from "./pages/AdminRentManagement/AdminRentManagement";
import AdminResidents from "./pages/AdminResidents/AdminResidents";
import PayYourRent from "./pages/PayYourRent/PayYourRent";

// Initialize Stripe
const rawStripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePublishableKey =
  typeof rawStripePublishableKey === "string"
    ? rawStripePublishableKey.trim()
    : "";

const getMaskedKey = (key) => {
  if (!key) return "(empty)";
  if (key.length <= 18) return key;
  return `${key.slice(0, 12)}...${key.slice(-6)}`;
};

// Stripe key validation handled silently

const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

function App() {
  return (
    <BrowserRouter>
      <div className="app-canvas">
        <Elements stripe={stripePromise}>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute role="resident">
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/complaints/new"
              element={
                <ProtectedRoute role="resident">
                  <Complaints />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pay-rent"
              element={
                <ProtectedRoute role="resident">
                  <PayYourRent />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <ProtectedRoute role="admin">
                  <AdminHome />
                </ProtectedRoute>
              }
            />
            <Route path="/admin/home" element={<Navigate to="/admin" replace />} />
            <Route
              path="/admin/complaints"
              element={
                <ProtectedRoute role="admin">
                  <AdminPanel />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/providers"
              element={
                <ProtectedRoute role="admin">
                  <AdminProviders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/residents"
              element={
                <ProtectedRoute role="admin">
                  <AdminResidents />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/rent"
              element={
                <ProtectedRoute role="admin">
                  <AdminRentManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/analytics"
              element={
                <ProtectedRoute role="admin">
                  <AdminAnalytics />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Elements>
      </div>
    </BrowserRouter>
  );
}

export default App;
