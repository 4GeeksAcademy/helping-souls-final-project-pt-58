import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { EventFilters } from "../components/EventFilters";

export const CampaignsBoard = () => {
  const navigate = useNavigate();

  // ===== ESTADOS LOCALES =====
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(true);
  const [error, setError] = useState(null);

  // ===== FILTROS DESDE URL =====
  const [params] = useSearchParams();
  const category = (params.get("category") || "").toLowerCase();
  const location = (params.get("location") || "").toLowerCase();
  const from = params.get("from") || "";
  const to = params.get("to") || "";

  const storedUser = localStorage.getItem("user");
  const storeUser = storedUser ? JSON.parse(storedUser) : null;

  // helper para fechas (YYYY-MM-DD)
  const toDate = (s) => (s ? new Date(`${s}T00:00:00`) : null);
  const fromDate = toDate(from);
  const toDateObj = toDate(to);

  // ===== USEEFFECT: CARGA DE CAMPAÑAS =====
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setIsAuthorized(false);
      setLoading(false);
      return;
    }

    const fetchCampaigns = async () => {
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL;

        const response = await fetch(`${backendUrl}/api/events`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 401 || response.status === 403) {
          throw new Error("Unauthorized");
        }

        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || "Server error");
        }

        const data = await response.json();
        setCampaigns(data.events || []);
      } catch (err) {
        console.error("Fetch campaigns error:", err);
        if (err.message === "Unauthorized") setIsAuthorized(false);
        else setError("An error occurred while loading campaigns.");
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  // ===== APLICAR FILTROS (FRONTEND) =====
  const filteredCampaigns = campaigns.filter((c) => {
    // Category: match exact (case-insensitive)
    if (category) {
      const cCat = (c.category || "").toLowerCase();
      if (cCat !== category) return false;
    }

    // Location: substring match (case-insensitive)
    if (location) {
      const cLoc = (c.location || "").toLowerCase();
      if (!cLoc.includes(location)) return false;
    }

    // Date range
    if (fromDate || toDateObj) {
      if (!c.event_date) return false;
      const eventDate = toDate(c.event_date);
      if (!eventDate) return false;

      if (fromDate && eventDate < fromDate) return false;
      if (toDateObj && eventDate > toDateObj) return false;
    }

    return true;
  });

  /* =========================
       RENDER ESTADOS ESPECIALES
     ========================= */
  if (loading) return <p className="text-center mt-4">Loading campaigns...</p>;

  if (!isAuthorized) {
    return (
      <div className="container mt-5 text-center">
        <h4 className="mb-3">Please log in to access this portion of the site</h4>
        <button className="btn btn-primary" onClick={() => navigate("/login")}>
          Go to Login
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5 text-center">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  /* =========================
       MAIN VIEW
     ========================= */
  return (
    <div className="container mt-4">
      {/* HEADER + BOTÓN CREAR */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">Campaigns Board</h2>

        {storeUser?.role === "organizer" && (
          <button className="btn btn-success" onClick={() => navigate("/events")}>
            Create Campaign
          </button>
        )}
      </div>

      {/* ✅ FILTROS AQUÍ */}
      <EventFilters />

      {/* GRID */}
      {filteredCampaigns.length === 0 ? (
        <p className="text-center">No campaigns match your filters</p>
      ) : (
        <div className="row">
          {filteredCampaigns.map((campaign) => (
            <div className="col-md-4 mb-4" key={campaign.eventID}>
              <div className="card h-100 shadow-sm text-center">
                <div className="card-body">
                  <h5 className="card-title">{campaign.name}</h5>

                  {campaign.category && (
                    <span className="badge bg-success mb-2">{campaign.category}</span>
                  )}

                  {campaign.event_date && (
                    <p className="mb-1">
                      <strong>Date:</strong> {campaign.event_date}
                    </p>
                  )}

                  <p className="mb-1">
                    <strong>Location:</strong> {campaign.location}
                  </p>
                </div>

                <div className="card-footer bg-transparent">
                  <button
                    className="btn btn-outline-primary w-100"
                    onClick={() => navigate(`/campaigns/${campaign.eventID}`)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
