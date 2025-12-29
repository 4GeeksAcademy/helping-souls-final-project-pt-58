import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const DetailedCampaign = () => {
  const { id } = useParams(); // eventID desde la URL
  const navigate = useNavigate();
  const { store } = useGlobalReducer();

  // ===== LOCAL STATES =====
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    // 🔐 Protección por auth
    if (!store.isAuth || !store.token) {
      navigate("/login");
      return;
    }

    const fetchCampaign = async () => {
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL;

        const response = await fetch(
          `${backendUrl}/api/events/${id}`,
          {
            headers: {
              Authorization: `Bearer ${store.token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Error loading campaign");
        }

        const data = await response.json();
        setCampaign(data.event); // 👈 clave según tu endpoint
      } catch (err) {
        console.error(err);
        setError("An error occurred while loading the campaign.");
      } finally {
        setLoading(false);
      }
    };

    fetchCampaign();
  }, [id, store.isAuth, store.token, navigate]);

  /* =========================
       STATES
     ========================= */

  if (loading) {
    return <p className="text-center mt-4">Loading campaign...</p>;
  }

  if (error) {
    return (
      <div className="container mt-5 text-center">
        <div className="alert alert-danger">{error}</div>
        <button
          className="btn btn-secondary mt-3"
          onClick={() => navigate("/campaigns")}
        >
          Back to campaigns
        </button>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="container mt-5 text-center">
        <p>Campaign not found</p>
        <button
          className="btn btn-secondary mt-3"
          onClick={() => navigate("/campaigns")}
        >
          Back to campaigns
        </button>
      </div>
    );
  }

  /* =========================
       MAIN VIEW
     ========================= */

  return (
    <div className="container mt-4">
      {/* ===== BACK ===== */}
      <button
        className="btn btn-outline-secondary mb-4"
        onClick={() => navigate("/campaigns")}
      >
        ← Back to campaigns
      </button>

      <div className="card shadow">
        <div className="card-body">
          <h2 className="card-title mb-3">{campaign.name}</h2>

          {/* CATEGORY */}
          {campaign.category && (
            <span className="badge bg-success mb-3">
              {campaign.category}
            </span>
          )}

          {/* BASIC INFO */}
          <p>
            <strong>Date:</strong>{" "}
            {campaign.event_date || "Not specified"}
          </p>

          <p>
            <strong>Location:</strong>{" "}
            {campaign.location || "Not specified"}
          </p>

          <p>
            <strong>Max volunteers:</strong>{" "}
            {campaign.max_volunteers ?? "Unlimited"}
          </p>

          {/* DESCRIPTION */}
          {campaign.description && (
            <>
              <hr />
              <p>{campaign.description}</p>
            </>
          )}

          {/* ===== ACTIONS ===== */}
          {store.user?.role === "volunteer" && (
            <div className="mt-4">
              {!showForm ? (
                <button
                  className="btn btn-primary"
                  onClick={() => setShowForm(true)}
                >
                  Me interesa
                </button>
              ) : (
                <VolunteerForm
                  campaignId={campaign.eventID}
                  token={store.token}
                  onCancel={() => setShowForm(false)}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};