import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { EventFilters } from "../components/EventFilters";

export const CampaignsBoard = () => {
  const navigate = useNavigate();

  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(true);
  const [error, setError] = useState(null);

  const [params] = useSearchParams();
  const category = (params.get("category") || "").toLowerCase();
  const location = (params.get("location") || "").toLowerCase();
  const from = params.get("from") || "";
  const to = params.get("to") || "";

  const storedUser = localStorage.getItem("user");
  const storeUser = storedUser ? JSON.parse(storedUser) : null;

  const toDate = (s) => (s ? new Date(`${s}T00:00:00`) : null);
  const fromDate = toDate(from);
  const toDateObj = toDate(to);

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

  const filteredCampaigns = campaigns.filter((c) => {
    if (category) {
      const cCat = (c.category || "").toLowerCase();
      if (!cCat.includes(category)) return false;
    }

    if (location) {
      const cLoc = (c.location || "").toLowerCase();
      if (!cLoc.includes(location)) return false;
    }

    if (fromDate || toDateObj) {
      if (!c.event_date) return false;
      const eventDate = toDate(String(c.event_date).slice(0, 10));
      if (!eventDate) return false;

      if (fromDate && eventDate < fromDate) return false;
      if (toDateObj && eventDate > toDateObj) return false;
    }

    return true;
  });

  if (loading) return <p className="text-center mt-4">Loading campaigns...</p>;

  /* ===============================
     NOT AUTHORIZED
  ================================ */
  if (!isAuthorized) {
    return (
      <div className="container mt-5">
        {/* HUMANITARIAN INTRO */}
        <div className="mb-5">
          <h2 className="text-center mb-4">Ways You Can Make a Difference</h2>

          <div className="row">
            {/* Humanitarian Aid */}
            <div className="col-md-4 mb-4">
              <div className="card h-100 shadow-sm">
                <img
                  src="https://images.unsplash.com/photo-1584515933487-779824d29309"
                  className="card-img-top"
                  alt="Caring for elderly people"
                />
                <div className="card-body">
                  <h5 className="card-title">Humanitarian Aid</h5>
                  <p className="card-text">
                    Support seniors and vulnerable communities through meaningful volunteer work.
                  </p>
                </div>
              </div>
            </div>

            {/* Environmental Care */}
            <div className="col-md-4 mb-4">
              <div className="card h-100 shadow-sm">
                <img
                  src="https://images.unsplash.com/photo-1618477461853-cf6ed80faba5"
                  className="card-img-top"
                  alt="Environmental care"
                />
                <div className="card-body">
                  <h5 className="card-title">Environmental Care</h5>
                  <p className="card-text">
                    Protect forests, beaches, and ecosystems for future generations.
                  </p>
                </div>
              </div>
            </div>

            {/* Animal Welfare */}
            <div className="col-md-4 mb-4">
              <div className="card h-100 shadow-sm">
                <img
                  src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b"
                  className="card-img-top"
                  alt="Animal Welfare"
                />
                <div className="card-body">
                  <h5 className="card-title">Animal Welfare</h5>
                  <p className="card-text">
                    Help rescue and care for abandoned animals in shelters and communities.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-4">
            <h5 className="mb-3">
              Join Helping Souls to explore and participate in these campaigns
            </h5>
            <button className="btn btn-primary px-4" onClick={() => navigate("/signup")}>
              Create an account
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ===============================
     AUTHORIZED VIEW
  ================================ */
  return (
    <div className="container">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Campaigns Board</h2>

        {storeUser?.role === "organizer" && (
          <button className="btn btn-success" onClick={() => navigate("/events")}>
            Create Campaign
          </button>
        )}
      </div>

      {/* INFO */}
      <div className="d-flex justify-content-between align-items-center mb-2">
        <small className="text-muted">
          Filters active: {["category", "location", "from", "to"].filter((k) => params.get(k)).length}
        </small>
        <small className="text-muted">
          Showing {filteredCampaigns.length} / {campaigns.length}
        </small>
      </div>

      <EventFilters />


      {/* CAMPAIGNS */}
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
                    <span className="badge bg-primary mb-2">
                      {campaign.category}
                    </span>
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
{/* INTRO CARDS (ULTRA COMPACT) */}
      <div className="mt-5">

        <div className="row justify-content-center g-3 mt-3 mb-5">
          {/* Humanitarian */}
          <div className="col-12 col-md-4 col-lg-3">
            <div className="d-flex align-items-center gap-3 p-2 border rounded shadow-sm">
              <img
                src="https://images.unsplash.com/photo-1584515933487-779824d29309"
                alt="Humanitarian Aid"
                style={{
                  width: "56px",
                  height: "56px",
                  objectFit: "cover",
                  borderRadius: "50%",
                }}
              />
              <div>
                <div className="fw-semibold small">Humanitarian Aid</div>
                <small className="text-muted">Support people in need</small>
              </div>
            </div>
          </div>

          {/* Environment */}
          <div className="col-12 col-md-4 col-lg-3">
            <div className="d-flex align-items-center gap-3 p-2 border rounded shadow-sm">
              <img
                src="https://images.unsplash.com/photo-1618477461853-cf6ed80faba5"
                alt="Environmental Care"
                style={{
                  width: "56px",
                  height: "56px",
                  objectFit: "cover",
                  borderRadius: "50%",
                }}
              />
              <div>
                <div className="fw-semibold small">Environmental Care</div>
                <small className="text-muted">Protect nature</small>
              </div>
            </div>
          </div>

          {/* Animals */}
          <div className="col-12 col-md-4 col-lg-3">
            <div className="d-flex align-items-center gap-3 p-2 border rounded shadow-sm">
              <img
                src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b"
                alt="Animal Welfare"
                style={{
                  width: "56px",
                  height: "56px",
                  objectFit: "cover",
                  borderRadius: "50%",
                }}
              />
              <div>
                <div className="fw-semibold small">Animal Welfare</div>
                <small className="text-muted">Care for animals</small>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
