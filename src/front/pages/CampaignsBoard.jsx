import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { EventFilters } from "../components/EventFilters";

/* ===============================
   ADD: Countdown + Google Calendar helpers
================================ */

function formatCountdown(ms) {
  if (!Number.isFinite(ms)) return "";
  if (ms <= 0) return "Event started";

  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n) => String(n).padStart(2, "0");

  if (days > 0) return `${days}d ${hours}h ${minutes}m ${pad(seconds)}s`;
  if (hours > 0) return `${hours}h ${minutes}m ${pad(seconds)}s`;
  return `${minutes}m ${pad(seconds)}s`;
}

function Countdown({ eventDate }) {
  // eventDate can be "YYYY-MM-DD" or ISO
  const target = useMemo(() => new Date(eventDate).getTime(), [eventDate]);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <small className="text-muted d-block" style={{ opacity: 0.9 }}>
      ⏳ {formatCountdown(target - now)}
    </small>
  );
}

function toGoogleCalendarDate(dateLike) {
  const d = new Date(dateLike);
  const pad = (n) => String(n).padStart(2, "0");

  // YYYYMMDDTHHMMSSZ (UTC)
  const yyyy = d.getUTCFullYear();
  const mm = pad(d.getUTCMonth() + 1);
  const dd = pad(d.getUTCDate());

  // If your date is "YYYY-MM-DD" (midnight), set a default time so it doesn’t become a weird 0-length event
  const hh = pad(d.getUTCHours() || 17);
  const mi = pad(d.getUTCMinutes() || 0);
  const ss = pad(d.getUTCSeconds() || 0);

  return `${yyyy}${mm}${dd}T${hh}${mi}${ss}Z`;
}

function buildGoogleCalendarUrl(campaign) {
  const title = encodeURIComponent(campaign?.name || "Event");
  const details = encodeURIComponent(campaign?.description || "");
  const location = encodeURIComponent(campaign?.location || "");

  const start = toGoogleCalendarDate(campaign?.event_date);

  // End time: +2 hours default
  const endDate = new Date(campaign?.event_date);
  endDate.setHours(endDate.getHours() + 2);
  const end = toGoogleCalendarDate(endDate);

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${start}/${end}`;
}

/* ===============================
   COMPONENT
================================ */

export const CampaignsBoard = () => {
  const navigate = useNavigate();

  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const [params] = useSearchParams();
  const category = (params.get("category") || "").toLowerCase();
  const city = (params.get("city") || "").toLowerCase();
  const from = params.get("from") || "";
  const to = params.get("to") || "";

  const storedUser = localStorage.getItem("user");
  const storeUser = storedUser ? JSON.parse(storedUser) : null;

  const toDate = (s) => (s ? new Date(`${s}T00:00:00`) : null);
  const fromDate = toDate(from);
  const toDateObj = toDate(to);

  const categoryStyles = {
    environmental: { bg: "#9ECAD6", color: "#fff" }, // celeste claro
    animal: { bg: "#748DAE", color: "#fff" },        // azul medio
    humanitarian: { bg: "#F5CBCB", color: "#000" },  // rosa
    default: { bg: "#FFEAEA", color: "#000" },       // rosa muy claro
  };

  const getCategoryStyle = (category = "") =>
    categoryStyles[category.toLowerCase()] || categoryStyles.default;

  /* Fetch campaigns */
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
          throw new Error("Server error");
        }

        const data = await response.json();
        setCampaigns(data.events || []);
      } catch (err) {
        if (err.message === "Unauthorized") setIsAuthorized(false);
        else setError("An error occurred while loading campaigns.");
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  /* Filters logic */
  const filteredCampaigns = campaigns.filter((c) => {
    if (category && !(c.category || "").toLowerCase().includes(category))
      return false;
    if (city && !(c.city || "").toLowerCase().includes(city)) return false;

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

  if (error) {
    return <p className="text-center mt-4 text-danger">{error}</p>;
  }

  /* ===============================
     NOT AUTHORIZED
  ================================ */
  if (!isAuthorized) {
    return (
      <div className="container mt-5">
        <div className="mb-5">
          <h2 className="text-center mb-4">Ways You Can Make a Difference</h2>

          <div className="row">
            {[
              {
                img: "https://images.unsplash.com/photo-1584515933487-779824d29309",
                title: "Humanitarian Aid",
                text: "Support seniors and vulnerable communities through meaningful volunteer work.",
              },
              {
                img: "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5",
                title: "Environmental Care",
                text: "Protect forests, beaches, and ecosystems for future generations.",
              },
              {
                img: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b",
                title: "Animal Welfare",
                text: "Help rescue and care for abandoned animals in shelters and communities.",
              },
            ].map((c, i) => (
              <div className="col-md-4 mb-4" key={i}>
                <div className="card h-100 shadow-sm">
                  <img src={c.img} className="card-img-top" alt={c.title} />
                  <div className="card-body">
                    <h5 className="card-title">{c.title}</h5>
                    <p className="card-text">{c.text}</p>
                  </div>
                </div>
              </div>
            ))}
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
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Campaigns Board</h2>

        {storeUser?.role === "organizer" && (
          <button
            className="btn"
            style={{ backgroundColor: "#748DAE", color: "#fff", borderRadius: "20px" }}
            onClick={() => navigate("/events")}
          >
            Create Campaign
          </button>
        )}
      </div>

      {/* Filter toggle */}
      <div className="text-center mb-4">
        <button
          className="btn"
          style={{
            backgroundColor: "#fff",
            color: "#748DAE",
            borderRadius: "20px",
            border: "1px solid #748DAE",
            padding: "0.5rem 1.5rem",
          }}
          onClick={() => setShowFilters(!showFilters)}
        >
          {showFilters ? "Hide filters" : "Show filters"}
        </button>
      </div>

      {/* Animated filters */}
      <div
        style={{
          maxHeight: showFilters ? "300px" : "0",
          overflow: "hidden",
          transition: "max-height 0.4s ease",
        }}
      >
        <EventFilters />
      </div>

      {/* Campaign cards */}
      <div className="d-flex flex-column gap-3 mt-4">
        {filteredCampaigns.map((campaign) => {
          const isOwnCampaign =
            Number(storeUser?.organizerID) === Number(campaign.organizerID);

          return (
            <div
              key={campaign.eventID}
              className="d-flex align-items-center p-3"
              style={{
                backgroundColor: "#fff",
                borderRadius: "18px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                position: "relative",
              }}
            >
              {/* Badge para campaña propia */}
              {isOwnCampaign && (
                <span
                  style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    backgroundColor: "#2E7D32", 
                    color: "#fff",               
                    padding: "4px 8px",
                    borderRadius: "12px",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                  }}
                >
                  Your campaign
                </span>
              )}


              <img
                src={
                  campaign.image
                    ? campaign.image.replace(
                      "/upload/",
                      "/upload/f_auto,q_auto,w_120,h_120,c_fill/"
                    )
                    : "https://placehold.co/120"
                }
                alt={campaign.name}
                style={{
                  width: "90px",
                  height: "90px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  marginRight: "1rem",
                }}
              />

              <div className="flex-grow-1">
                <div className="d-flex align-items-center gap-2 mb-1">
                  <h5 className="mb-0">{campaign.name}</h5>

                  <span
                    style={{
                      backgroundColor: getCategoryStyle(campaign.category).bg,
                      color: getCategoryStyle(campaign.category).color,
                      padding: "2px 10px",
                      borderRadius: "12px",
                      fontSize: "0.75rem",
                      fontWeight: 500,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {campaign.category}
                  </span>
                </div>

                <div className="text-muted" style={{ fontSize: "0.85rem" }}>
                  <div>📍 {campaign.city}</div>
                  <div>📅 {campaign.event_date}</div>
                </div>
              </div>

              <button
                className="btn"
                style={{ backgroundColor: "#748DAE", color: "#fff", borderRadius: "18px" }}
                onClick={() => navigate(`/campaigns/${campaign.eventID}`)}
              >
                View
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
