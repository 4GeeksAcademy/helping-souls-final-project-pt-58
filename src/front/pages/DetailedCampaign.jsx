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

  const [isWrongOrganizer, setIsWrongOrganizer] = useState(false); // NUEVO

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

        // --- VALIDACIÓN DEL ORGANIZADOR ---
        if (
          store.user?.role === "organizer" &&
          store.user.userID !== campaignData.event.organizerID
        ) {
          setIsWrongOrganizer(true);
        }

        if (store.user?.role === "volunteer") {
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

  if (error) {
    return (
      <div className="container mt-5 text-center">
        <div className="alert alert-danger">{error}</div>
        <button
          className="btn btn-secondary mt-3"
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
      {/* BACK */}
      <button
        className="btn btn-outline-secondary mb-4"
        onClick={() => navigate("/campaignsboard")}
      >
        ← Back to campaigns
      </button>

      <div className="card shadow-sm">
        <div className="card-body">
          {/* MENSAJE SI ORGANIZADOR DISTINTO */}
          {isWrongOrganizer && (
            <div className="alert alert-warning text-center">
              You're not the organizer for this event
            </div>
          )}

          {/* TITLE + ACTIONS */}
          <div className="d-flex justify-content-between align-items-start mb-2">
            <h2 className="mb-0">{campaign.name}</h2>

            {store.user?.role === "organizer" && !isWrongOrganizer && (
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={() => navigate(`/campaigns/${id}/edit`)}
                title="Edit campaign"
              >
                ✏️ Edit
              </button>
            )}
          </div>

          {/* ORGANIZER */}
          {campaign.organizerID && (
            <small className="text-muted d-block mb-2">
              Organizer:{" "}
              <Link
                to={`/profile/organizer/${campaign.organizerID}`}
                className="text-decoration-none"
              >
                {campaign.organizer_name || "View organizer profile"}
              </Link>
            </small>
          )}

          {/* CATEGORY */}
          {campaign.category && (
            <span className="badge bg-success mb-3">{campaign.category}</span>
          )}

          {/* IMAGE */}
          {campaign.image && (
            <div className="my-4">
              <img
                src={campaign.image.replace(
                  "/upload/",
                  "/upload/f_auto,q_auto,w_1000/"
                )}
                alt={campaign.name}
                className="img-fluid rounded shadow-sm"
                style={{
                  width: "100%",
                  maxHeight: "420px",
                  objectFit: "cover",
                }}
              />
            </div>
          )}

          {/* INFO GRID */}
          <div className="row g-3 mb-4">
            <div className="col-md-3 col-6">
              <div className="border rounded p-3 h-100">
                <small className="text-muted d-block">Date</small>
                <strong>{campaign.event_date}</strong>
              </div>
            </div>

            <div className="col-md-3 col-6">
              <div className="border rounded p-3 h-100">
                <small className="text-muted d-block">Time</small>
                <strong>{campaign.event_time || "—"}</strong>
              </div>
            </div>

            <div className="col-md-3 col-6">
              <div className="border rounded p-3 h-100">
                <small className="text-muted d-block">City</small>
                <strong>{campaign.city || "—"}</strong>
              </div>
            </div>

            <div className="col-md-3 col-6">
              <div className="border rounded p-3 h-100">
                <small className="text-muted d-block">Max volunteers</small>
                <strong>{campaign.max_volunteers ?? "Unlimited"}</strong>
              </div>
            </div>
          </div>

          {/* LOCATION */}
          <div className="mb-4">
            <small className="text-muted d-block">Location</small>
            <strong>{campaign.location}</strong>
          </div>

          {/* DESCRIPTION */}
          {campaign.description && (
            <div className="mb-4">
              <h5 className="mb-2">About this campaign</h5>
              <p className="text-muted mb-0">{campaign.description}</p>
            </div>
          )}

          <hr />

          {/* ORGANIZER VIEW */}
          {store.user?.role === "organizer" && !isWrongOrganizer && (
            <EventInscriptions eventId={id} />
          )}

          {/* VOLUNTEER ACTIONS */}
          {store.user?.role === "volunteer" &&
            (!isInscribed ? (
              <div className="d-flex gap-2 flex-wrap">
                <button
                  className="btn btn-primary"
                  onClick={() => navigate(`/campaigns/${id}/apply`)}
                  disabled={isWrongOrganizer} // DESHABILITADO si es organizador incorrecto
                >
                  Register
                </button>

                {!isInterested ? (
                  <button
                    className="btn btn-outline-warning"
                    onClick={handleInterest}
                    disabled={interestLoading || isWrongOrganizer} // DESHABILITADO si organizador incorrecto
                  >
                    {interestLoading ? "Saving..." : "Save for later"}
                  </button>
                ) : (
                  <span className="badge bg-warning text-dark align-self-center">
                    Saved in My Interests
                  </span>
                )}
              </div>
            ) : (
              <div className="alert alert-success mt-3">
                You are already registered — Status: {inscription.status}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
