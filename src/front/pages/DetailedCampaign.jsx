import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { EventInscriptions } from "../components/EventInscriptions";
import EventCountdown from "../components/EventCountdown";

/* ===== Google Calendar helper INLINE ===== */
function yyyymmdd(dateStr) {
  return String(dateStr).slice(0, 10).replaceAll("-", "");
}

function addDays(dateStr, days) {
  const d = new Date(`${String(dateStr).slice(0, 10)}T00:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function buildGoogleCalendarUrl({ title, dateISO, description, location }) {
  if (!dateISO) return null;

  const start = yyyymmdd(dateISO);
  const end = yyyymmdd(addDays(dateISO, 1));

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title || "Volunteer Event",
    dates: `${start}/${end}`,
    details: description || "",
    location: location || "",
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/* ===== Google Maps helper INLINE ===== */
function GoogleMapEmbed({ location, height = 320 }) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (!location) return null;

  // Sin key (rápido)
  const fallbackSrc = `https://www.google.com/maps?q=${encodeURIComponent(location)}&output=embed`;

  // Con key (recomendado, más estable)
  const src = apiKey
    ? `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodeURIComponent(location)}`
    : fallbackSrc;

  return (
    <div
      style={{
        width: "100%",
        borderRadius: "18px",
        overflow: "hidden",
        boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
        background: "#fff",
      }}
    >
      <iframe
        title="Google Map"
        width="100%"
        height={height}
        style={{ border: 0, display: "block" }}
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        src={src}
      />
    </div>
  );
}

export const DetailedCampaign = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { store } = useGlobalReducer();

  const token = store?.token || localStorage.getItem("token");

  const [campaign, setCampaign] = useState(null);
  const [inscription, setInscription] = useState(null); // por si lo usas luego
  const [isInscribed, setIsInscribed] = useState(false);
  const [isInterested, setIsInterested] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [interestLoading, setInterestLoading] = useState(false);

  useEffect(() => {
    if (!store?.token || !store?.isAuth) {
      navigate("/login");
    }
  }, [store?.token, store?.isAuth, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL;

        // ===== FETCH CAMPAIGN =====
        const campaignRes = await fetch(`${backendUrl}/api/events/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (campaignRes.status === 401 || campaignRes.status === 403) {
          navigate("/login");
          return;
        }

        if (!campaignRes.ok) throw new Error("Campaign not found");

        const campaignData = await campaignRes.json();
        setCampaign(campaignData.event);

        // ===== VOLUNTEER ONLY: INSCRIPTION + INTEREST =====
        if (store?.user?.role === "volunteer") {
          // INSCRIPTION
          const inscriptionRes = await fetch(
            `${backendUrl}/api/events/${id}/inscription`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (inscriptionRes.ok) {
            const inscriptionData = await inscriptionRes.json();

            const inscribed =
              Boolean(inscriptionData?.inscription) ||
              inscriptionData?.isInscribed === true ||
              inscriptionData?.is_inscribed === true ||
              inscriptionData?.inscribed === true;

            if (inscribed) {
              setIsInscribed(true);
              setInscription(inscriptionData.inscription || inscriptionData);
            } else {
              setIsInscribed(false);
              setInscription(null);
            }
          } else {
            setIsInscribed(false);
            setInscription(null);
          }

          // INTEREST (GET)
          const interestRes = await fetch(
            `${backendUrl}/api/events/${id}/interest`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (interestRes.ok) {
            const interestData = await interestRes.json();
            setIsInterested(Boolean(interestData?.isInterested));
          } else {
            setIsInterested(false);
          }
        }
      } catch (err) {
        console.error(err);
        setError("Error loading campaign details");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, token, store?.user?.role, navigate]);

  // ===== HANDLER: SAVE INTEREST =====
  const handleInterest = async () => {
    try {
      setInterestLoading(true);
      const backendUrl = import.meta.env.VITE_BACKEND_URL;

      const res = await fetch(`${backendUrl}/api/events/${id}/interest`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to save interest");

      setIsInterested(true);
    } catch (err) {
      console.error(err);
      alert("Error saving interest");
    } finally {
      setInterestLoading(false);
    }
  };

  if (loading) return <p className="text-center mt-4">Loading campaign...</p>;

  if (error || !campaign) {
    return (
      <div className="container mt-5 text-center">
        <div className="alert alert-danger">{error || "Campaign not found"}</div>
        <button
          className="btn btn-secondary"
          onClick={() => navigate("/campaignsboard")}
        >
          Back to campaigns
        </button>
      </div>
    );
  }

  const gcalUrl = buildGoogleCalendarUrl({
    title: campaign.name,
    dateISO: campaign.event_date,
    description: campaign.description,
    location: campaign.location,
  });

  return (
    <div className="container mt-4">
      <button
        className="btn btn-outline-secondary mb-4"
        onClick={() => navigate("/campaignsboard")}
      >
        ← Back to campaigns
      </button>

      <div className="card shadow">
        <div className="card-body">
          <h2>{campaign.name}</h2>

          <p>
            <strong>Date:</strong> {campaign.event_date}
          </p>
          <p>
            <strong>Location:</strong> {campaign.location}
          </p>

          {/* VOLUNTEER: COUNTDOWN + CALENDAR */}
          {store?.user?.role === "volunteer" && (
            <>
              <EventCountdown eventDateISO={campaign.event_date} />

              {gcalUrl && (
                <a
                  className="btn btn-primary mt-2"
                  href={gcalUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Add to Google Calendar
                </a>
              )}
            </>
          )}

          <hr />

          {/* ORGANIZER */}
          {store?.user?.role === "organizer" && (
            <>
              <div className="alert alert-info">
                You are the organizer of this campaign.
              </div>
              <EventInscriptions eventId={id} />
            </>
          )}

          {/* VOLUNTEER ACTIONS */}
          {store?.user?.role === "volunteer" && (
            <>
              {!isInscribed ? (
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-primary"
                    onClick={() => navigate(`/campaigns/${id}/apply`)}
                  >
                    Register
                  </button>

                  {!isInterested ? (
                    <button
                      className="btn btn-outline-warning"
                      onClick={handleInterest}
                      disabled={interestLoading}
                    >
                      {interestLoading ? "Saving..." : "Save for later"}
                    </button>
                  ) : (
                    <span className="badge bg-warning text-dark">
                      Saved in My Interests
                    </span>
                  )}
                </div>
              ) : (
                <div className="alert alert-success">
                  You are already registered
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ✅ MAPA ABAJO (sin romper diseño) */}
      {campaign?.location && (
        <div className="mt-4">
          <h5 className="mb-2">Ubicación en el mapa</h5>
          <GoogleMapEmbed location={campaign.location} height={320} />
        </div>
      )}
    </div>
  );
};
