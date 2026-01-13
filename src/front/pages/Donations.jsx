import { useState } from "react";

export const Donations = () => {
  const [amount, setAmount] = useState(10);
  const [loading, setLoading] = useState(false);

  const handleDonate = async () => {
    try {
      setLoading(true);

      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      console.log("VITE_BACKEND_URL:", backendUrl);

      const res = await fetch(`${backendUrl}/api/create-checkout-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount })
      });

      const data = await res.json();
      console.log("Checkout status:", res.status);
      console.log("Checkout response:", data);

      if (!res.ok) {
        throw new Error(data.error || "Checkout failed");
      }

      if (!data.url) {
        throw new Error("No checkout URL returned (data.url is missing)");
      }

      window.location.href = data.url;
    } catch (err) {
      console.error("Donation error:", err);
      alert(err.message || "Error starting donation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div className="card shadow-lg p-4 donation-card">

        <h2 className="text-center mb-3">💖 Support Our Cause</h2>

        <p className="text-center text-muted mb-4">
          Your donation helps us continue creating a positive impact.
          Every contribution matters.
        </p>

        {/* Quick buttons */}
        <div className="d-flex justify-content-between mb-3">
          {[5, 10, 25].map(value => (
            <button
              key={value}
              className={`btn ${amount === value ? "btn-success" : "btn-outline-success"}`}
              onClick={() => setAmount(value)}
            >
              ${value}
            </button>
          ))}
        </div>

        {/* Custom amount */}
        <div className="mb-3">
          <label className="form-label">Custom Amount</label>
          <input
            type="number"
            min="1"
            className="form-control"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
        </div>

        {/* Donate button */}
        <button
          className="btn btn-success btn-lg w-100"
          onClick={handleDonate}
          disabled={loading}
        >
          {loading ? "Redirecting..." : `Donate $${amount}`}
        </button>

        <p className="text-center text-muted mt-3 small">
          Secure payments processed by Stripe 🔒
        </p>

      </div>
    </div>
  );
};
