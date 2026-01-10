import { useState } from "react";

export const Donations = () => {
  const [amount, setAmount] = useState(10);
  const [loading, setLoading] = useState(false);

  const handleDonate = async () => {
    setLoading(true);

    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/create-checkout-session`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount })
      }
    );

    const data = await res.json();
    window.location.href = data.url;
  };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div className="card shadow-lg p-4 donation-card">

        <h2 className="text-center mb-3">💖 Apoya nuestra causa</h2>

        <p className="text-center text-muted mb-4">
          Tu donación nos ayuda a seguir creando impacto positivo.
          Cualquier aporte cuenta.
        </p>

        {/* Botones rápidos */}
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

        {/* Monto personalizado */}
        <div className="mb-3">
          <label className="form-label">Monto personalizado</label>
          <input
            type="number"
            min="1"
            className="form-control"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
        </div>

        {/* Botón donar */}
        <button
          className="btn btn-success btn-lg w-100"
          onClick={handleDonate}
          disabled={loading}
        >
          {loading ? "Redirigiendo..." : `Donar $${amount}`}
        </button>

        <p className="text-center text-muted mt-3 small">
          Pagos seguros procesados por Stripe 🔒
        </p>

      </div>
    </div>
  );
};
