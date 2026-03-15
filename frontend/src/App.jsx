import { BrowserRouter, Routes, Route } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

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
import PayYourRent from "./pages/PayYourRent/PayYourRent";

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);






function App() {
  return (
    <BrowserRouter>
      <Elements stripe={stripePromise}>
        <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
         <Route path="/admin/providers" element=
         {
          <ProtectedRoute>
            <AdminProviders />
          </ProtectedRoute>

         
         } />
         <Route path="/admin/analytics" element={<AdminAnalytics />} />
         <Route path="/admin/home"element={<AdminHome/>}/>
         
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
         <Route
          path="/admin/complaints"
          element={
            <ProtectedRoute>
              <AdminPanel />
            </ProtectedRoute>
          }
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/profile" element={<Profile/>}/>
        
        {/* RENT ROUTES */}
        <Route
          path="/admin/rent"
          element={
            <ProtectedRoute role="admin">
              <AdminRentManagement />
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
        
        <Route path="/profile" element={<Profile/>}/>
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminHome />
            </ProtectedRoute>
          }
        />

        {/* default route */}
        <Route path="*" element={<Login />} />

        <Route
  path="/complaints/new"
  element={
    <ProtectedRoute>
      <Complaints />
    </ProtectedRoute>
  }
/>
       <Route
          path="/admin/home"
          element={
            <ProtectedRoute role="admin">
              <AdminHome />
            </ProtectedRoute>
          }
        />

      </Routes>
      </Elements>
    </BrowserRouter>

  );
}

export default App;
