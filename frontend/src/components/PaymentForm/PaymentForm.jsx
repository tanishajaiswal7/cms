import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useState } from "react";
import axios from "../../api/axios";
import "./PaymentForm.css";
import toast from "react-hot-toast";

function PaymentForm({ rentId, amount, onSuccess, onCancel }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handlePayment = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setError("Stripe is not loaded yet. Please try again.");
      toast.error("Stripe loading failed");
      return;
    }

    const payableAmount = Number(amount);

    if (!rentId || !Number.isFinite(payableAmount) || payableAmount <= 0) {
      setError("Invalid rent or amount information");
      toast.error("Invalid payment information");
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      toast.loading("Creating payment intent...", { id: "payment-toast" });

      // Step 1: Create payment intent on backend
      const intentResponse = await axios.post("/api/payments/create-intent", {
        rentId,
        amount: payableAmount,
      });

      if (!intentResponse.data.success) {
        throw new Error(intentResponse.data.message || "Failed to create payment intent");
      }

      const { clientSecret } = intentResponse.data.data;

      toast.loading("Processing payment...", { id: "payment-toast" });

      // Step 2: Confirm payment with Stripe
      const cardElement = elements.getElement(CardElement);

      if (!cardElement) {
        throw new Error("Card element not found");
      }

      const { error: stripeError, paymentIntent } =
        await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: "Rent Payment",
            },
          },
        });

      if (stripeError) {
        setError(stripeError.message);
        toast.error(stripeError.message, { id: "payment-toast" });
        setProcessing(false);
        return;
      }

      // Step 3: Confirm payment on backend
      if (paymentIntent.status === "succeeded") {
        toast.loading("Confirming payment...", { id: "payment-toast" });

        const confirmResponse = await axios.post("/api/payments/confirm", {
          paymentIntentId: paymentIntent.id,
          rentId,
        });

        if (confirmResponse.data.success) {
          setSuccess(true);
          toast.success("Payment successful! Your rent has been marked as paid.", {
            id: "payment-toast",
            duration: 3,
          });
          setProcessing(false);
          setTimeout(() => {
            onSuccess(confirmResponse.data.data);
          }, 2000);
        } else {
          throw new Error(
            confirmResponse.data.message || "Failed to confirm payment"
          );
        }
      } else {
        throw new Error(`Payment status: ${paymentIntent.status}`);
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Payment processing failed. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage, { id: "payment-toast" });
      setProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: "16px",
        color: "#020617",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        "::placeholder": {
          color: "#cbd5e1",
        },
        iconColor: "#94a3b8",
      },
      invalid: {
        color: "#ef4444",
        iconColor: "#ef4444",
      },
    },
    hidePostalCode: true,
  };

  return (
    <div className="payment-form-wrapper">
      <div className="payment-form-container">
        <h3>💳 Complete Payment</h3>
        <p className="amount-display">
          Amount to Pay: <strong>₹{amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</strong>
        </p>

        {success ? (
          <div className="payment-success">
            <div className="success-icon">✅</div>
            <p className="success-message">
              Payment successful! Your rent has been marked as paid.
            </p>
            <p className="success-submessage">
              Redirecting to your rent details...
            </p>
          </div>
        ) : (
          <form onSubmit={handlePayment}>
            <div className="card-element-wrapper">
              <label htmlFor="card-element">Card Details</label>
              <div id="card-element" className="card-element-container">
                <CardElement options={cardElementOptions} />
              </div>
            </div>

            {error && (
              <div className="error-message">
                <span className="error-icon">❌</span>
                <span>{error}</span>
              </div>
            )}

            <div className="form-actions">
              <button
                type="submit"
                disabled={!stripe || processing}
                className="btn-pay"
                aria-busy={processing}
              >
                {processing
                  ? "Processing..."
                  : `Pay ₹${amount.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}`}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="btn-cancel"
                disabled={processing}
              >
                Cancel
              </button>
            </div>

            <div className="test-card-info">
              <p>
                💡 <strong>Test Mode:</strong> Use card <code>4242 4242 4242 4242</code>
              </p>
              <p>Any future date • Any CVC code</p>
            </div>

            <div className="security-info">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
              <p>Your payment information is encrypted and secure.</p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default PaymentForm;
