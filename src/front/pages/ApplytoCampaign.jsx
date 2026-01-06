import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const ApplyToCampaign = () => {
  const { id } = useParams(); // eventID
  const navigate = useNavigate();
  const { store } = useGlobalReducer();

  /* ===== FORM STATE ===== */
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    documentId: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  /* ===== AUTH PROTECTION ===== */
  useEffect(() => {
    if (!store.token) {
      navigate("/login");
    }
  }, [store.token, navigate]);

  /* ===== HANDLERS ===== */
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    // 🔴 protección clave
    if (!backendUrl) {
      setError("Backend URL not configured");
      setLoading(false);
      return;
    }

    try {
      console.log("POST →", `${backendUrl}/api/events/${id}/apply`);
      console.log("DATA →", formData);

      const response = await fetch(
        `${backendUrl}/api/events/${id}/apply`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${store.token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || "Application failed");
      }

      setSuccess(true);

      setTimeout(() => {
        navigate(`/campaigns/${id}`);
      }, 2000);

    } catch (err) {
      console.error("APPLY ERROR:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ===== RENDER ===== */
  return (
    <div className="container mt-4" style={{ maxWidth: "600px" }}>
      <button
        className="btn btn-outline-secondary mb-4"
        onClick={() => navigate(`/campaigns/${id}`)}
      >
        ← Back to campaign
      </button>

      <div className="card shadow">
        <div className="card-body">
          <h3 className="card-title mb-3">Apply to Campaign</h3>

          {error && <div className="alert alert-danger">{error}</div>}
          {success && (
            <div className="alert alert-success">
              Application sent successfully 🎉
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* FULL NAME */}
            <div className="mb-3">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                className="form-control"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>

            {/* PHONE */}
            <div className="mb-3">
              <label className="form-label">Phone *</label>
              <input
                type="tel"
                className="form-control"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>

            {/* DOCUMENT ID */}
            <div className="mb-3">
              <label className="form-label">Document ID *</label>
              <input
                type="text"
                className="form-control"
                name="documentId"
                value={formData.documentId}
                onChange={handleChange}
                required
              />
            </div>

            {/* MESSAGE */}
            <div className="mb-3">
              <label className="form-label">Message (optional)</label>
              <textarea
                className="form-control"
                name="message"
                rows="3"
                value={formData.message}
                onChange={handleChange}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Application"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};