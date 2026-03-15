import { useState, useEffect } from "react";
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
  const residentUserId = user?._id || user?.id;

  useEffect(() => {
    if (residentUserId) {
      fetchRentData();
    }
  }, [selectedMonth, residentUserId]);

  const fetchRentData = async () => {
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
      console.error("Error fetching rent data:", error);
      setError(error.response?.data?.message || "Failed to load rent details");
      setRentData(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    setShowPaymentForm(false);
    fetchRentData();
  };

  return (
    <>
      <Navbar />

      <div className="pay-rent-container">

        <div className="pay-rent-header">
          <h1>💰 Pay Your Rent</h1>
          <p className="subtitle">View and pay your monthly rent</p>
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