import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "../../api/axios";
import Navbar from "../../components/Navbar/Navbar";
import PaymentForm from "../../components/PaymentForm/PaymentForm";
import "./PayYourRent.css";

function PayYourRent() {
  const { user } = useAuth();
  const [rentData, setRentData] = useState(null);
  const [allRents, setAllRents] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("current");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [stripeHealthWarning, setStripeHealthWarning] = useState(null);
  const residentUserId = user?._id || user?.id;

  useEffect(() => {
    checkStripeHealth();
  }, []);

  const checkStripeHealth = async () => {
    try {
      const response = await axios.get("/api/health/stripe");
      const healthData = response?.data?.data;

      if (!healthData?.stripeConfigured) {
        const firstWarning = healthData?.warnings?.[0];
        setStripeHealthWarning(
          firstWarning || "Payment service is not configured. Please contact admin."
        );
        return;
      }

      setStripeHealthWarning(null);
    } catch (stripeHealthError) {
      const status = stripeHealthError?.response?.status;

      if (status === 404) {
        setStripeHealthWarning(
          "Payment health check endpoint not found. Restart backend server and try again."
        );
        return;
      }

      setStripeHealthWarning(
        "Unable to verify payment service configuration. Please try again later."
      );
    }
  };

  const fetchRentData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!residentUserId) {
        return;
      }

      const allResponse = await axios.get(`/api/rents/resident/${residentUserId}`);
      setAllRents(allResponse.data.data || []);

      if (selectedMonth === "current") {
        try {
          const response = await axios.get("/api/rents/current-month");
          setRentData(response.data.data);
        } catch (currentMonthError) {
          if (currentMonthError.response?.status === 404) {
            setRentData(null);
            setError(null);
          } else {
            throw currentMonthError;
          }
        }
      } else {
        const rent = allResponse.data.data?.find(
          (r) => r.month === selectedMonth
        );
        setRentData(rent || null);
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to load rent details");
      setRentData(null);
    } finally {
      setLoading(false);
    }
  }, [residentUserId, selectedMonth]);

  useEffect(() => {
    if (residentUserId) {
      fetchRentData();
    }
  }, [fetchRentData, residentUserId]);

  const handlePaymentSuccess = () => {
    setShowPaymentForm(false);
    fetchRentData();
  };

  return (
    <>
      <Navbar />

      <div className="pay-rent-container">
        <div className="pay-rent-header-block">
          <div className="pay-rent-header">
            <div className="page-intro pay-rent-intro">
              <span className="page-kicker">Resident Payments</span>
              <h1 className="page-title">Review your monthly rent and complete payment securely.</h1>
              <p className="page-subtitle">
                Check the selected month, confirm the amount due, and pay through the integrated Stripe checkout flow.
              </p>
            </div>
          </div>

          <section className="insight-strip rent-summary-strip">
            <article className="insight-tile">
              <span className="insight-label">Available Months</span>
              <strong className="insight-value">{allRents.length}</strong>
            </article>
            <article className="insight-tile">
              <span className="insight-label">Selected</span>
              <strong className="insight-value rent-insight-status">
                {selectedMonth === "current" ? "Current" : selectedMonth}
              </strong>
            </article>
            <article className="insight-tile">
              <span className="insight-label">Status</span>
              <strong className="insight-value rent-insight-status">
                {rentData?.status || "No Record"}
              </strong>
            </article>
          </section>
        </div>

        {/* Month Selector */}

        <div className="month-selector-wrapper">
          <label>📅 Select Month:</label>

          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="month-select"
          >
            <option value="current">Current Month</option>

            {allRents.map((rent) => (
              <option key={rent._id} value={rent.month}>
                {new Date(rent.month + "-01").toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                })}
              </option>
            ))}
          </select>
        </div>

        {/* Loading */}

        {loading && (
          <div className="loading-state">
            ⏳ Loading your rent details...
          </div>
        )}

        {/* Error */}

        {error && (
          <div className="error-alert">
            ⚠️ {error}
          </div>
        )}

        {stripeHealthWarning && (
          <div className="error-alert">
            ⚠️ {stripeHealthWarning}
          </div>
        )}

        {/* Rent Details */}

        {!loading && rentData && (
          <div className="rent-details-card">

            <div className="user-info">

              <div className="avatar">
                {user?.name?.charAt(0).toUpperCase()}
              </div>

              <div className="user-details">
                <h2>{user?.name}</h2>
                <p>{user?.email}</p>
              </div>

            </div>

            <div className="status-section">
              <span className={`status-badge status-${rentData.status}`}>
                {rentData.status}
              </span>

              <p className="due-date">
                Due date: {rentData.dueDate ? new Date(rentData.dueDate).toLocaleDateString("en-IN") : "Not specified"}
              </p>
            </div>

            {/* Breakdown */}

            <div className="rent-breakdown">

              <h3>📋 Rent Breakdown</h3>

              <div className="breakdown-item">
                <span>Monthly Rent</span>
                <span>₹{rentData.rentAmount}</span>
              </div>

              {rentData.additionalCharges > 0 && (
                <div className="breakdown-item">
                  <span>Additional Charges</span>
                  <span>₹{rentData.additionalCharges}</span>
                </div>
              )}

              {rentData.fine > 0 && (
                <div className="breakdown-item">
                  <span>Fine</span>
                  <span>₹{rentData.fine}</span>
                </div>
              )}

              <div className="breakdown-item total">
                <span>Total</span>
                <span>₹{rentData.totalAmount}</span>
              </div>

            </div>

            {/* Payment */}

            <div className="payment-section">

              {rentData.status === "paid" ? (
                <div className="paid-message">
                  ✅ Payment Completed
                </div>
              ) : (
                <>
                  <p>
                    Amount Due: <strong>₹{rentData.totalAmount}</strong>
                  </p>

                  <button
                    className="btn-pay-now"
                    disabled={Boolean(stripeHealthWarning)}
                    onClick={() => setShowPaymentForm(true)}
                  >
                    💳 Pay Now
                  </button>
                </>
              )}

            </div>

          </div>
        )}

        {/* Empty State */}

        {!loading && !rentData && !error && (
          <div className="no-rent-state">
            <h3>No Rent Record Found</h3>
          </div>
        )}

        {/* Payment Form */}

        {showPaymentForm && rentData && (
          <PaymentForm
            rentId={rentData._id}
            amount={rentData.totalAmount}
            onSuccess={handlePaymentSuccess}
            onCancel={() => setShowPaymentForm(false)}
          />
        )}

      </div>
    </>
  );
}

export default PayYourRent;