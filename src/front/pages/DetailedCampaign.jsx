import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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
    location: location || ""
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export const DetailedCampaign = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { store } = useGlobalReducer();

  // 🔥 TOKEN CONSISTENTE (store o localStorage)
  const token = store?.token || localStorage.getItem("token");

  // 🔥 DEBUG DE TOKENS (ESTO ES LO QUE NECESITAMOS VER)
  console.log("TOKENS CHECK 👉", {
    storeToken: store?.token,
    lsToken: localStorage.getItem("token"),
    isAuth: store?.isAuth,
    user: store?.user
  });

  /* ===== STATES ===== */
  const [campaign, setCampaign] = useState(null);
  const [inscription, setInscription] = useState(null);
  const [isInscribed, setIsInscribed] = useState(false);
  const [isInterested, setIsInterested] = useState(false);
  
 console.log("role:", store.user?.role, "isInscribed:", isInscribed);

>>>>>>> 21c7ef2 (haciendo el temporizador y el boton de google)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [interestLoading, setInterestLoading] = useState(false);

  useEffect(() => {
    if (!store.token || !store.isAuth) {
      navigate("/login");
    }
  }, [store.token, store.isAuth, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL;

        /* Obtener campaña */
        const campaignRes = await fetch(`${backendUrl}/api/events/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
>>>>>>> 21c7ef2 (haciendo el temporizador y el boton de google)
        });

        if (campaignRes.status === 401 || campaignRes.status === 403) {
          navigate("/login");
          return;
        }

        if (!campaignRes.ok) throw new Error("Campaign not found");

        const campaignData = await campaignRes.json();
        setCampaign(campaignData.event);

        /* Verificar inscripción (solo volunteer) */
        if (store.user?.role === "volunteer") {
          const inscriptionRes = await fetch(`${backendUrl}/api/events/${id}/inscription`, {
            headers: {
              Authorization: `Bearer ${store.token}`,
            },
          });

          const text = await inscriptionRes.text();
          console.log("INSCRIPTION RAW 👉", text, "status:", inscriptionRes.status);

          let inscriptionData = {};
          try {
            inscriptionData = text ? JSON.parse(text) : {};
          } catch {
            inscriptionData = { raw: text };
          }

          console.log("INSCRIPTION PARSED 👉", inscriptionData);

          const inscribed =
            Boolean(inscriptionData?.inscription) ||
            inscriptionData?.isInscribed === true ||
            inscriptionData?.is_inscribed === true ||
            inscriptionData?.inscribed === true;

          if (inscriptionRes.ok && inscribed) {
            setIsInscribed(true);
            setInscription(inscriptionData.inscription || inscriptionData);
          } else {
            setIsInscribed(false);
            setInscription(null);
          }

          const interestRes = await fetch(
            `${backendUrl}/api/events/${id}/interest`,
            { headers: { Authorization: `Bearer ${store.token}` } }
          );
          // ===== FETCH INTEREST =====
          const interestRes = await fetch(
            `${backendUrl}/api/events/${id}/interest`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const interestData = await interestRes.json();
          setIsInterested(Boolean(interestData?.isInterested));
        }
      } catch (err) {
        console.error(err);
        setError("Error loading campaign details");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, token, store?.user]);

  /* ===== HANDLER: ME INTERESA ===== */
  const handleInterest = async () => {
    try {
      setInterestLoading(true);
      const backendUrl = import.meta.env.VITE_BACKEND_URL;

      const res = await fetch(
        `${backendUrl}/api/events/${id}/interest`,
        {
          method: "POST",
  <<<<<<< HEAD
        headers: { Authorization: `Bearer ${store.token}` },
      });
=======
        headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to save interest");
>>>>>>> 21c7ef2 (haciendo el temporizador y el boton de google)

      if (!res.ok) throw new Error("Failed to save interest");
      setIsInterested(true);
    } catch (err) {
      alert("Error saving interest");
    } finally {
      setInterestLoading(false);
    }
  };

  /* ===== LOADING / ERROR ===== */
  if (loading) return <p className="text-center mt-4">Loading campaign...</p>;

  if (error || !campaign) {
    return (
      <div className="container mt-5 text-center">
        <div className="alert alert-danger">
          {error || "Campaign not found"}
        </div>
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

  /* ===== MAIN VIEW ===== */
  return (
    <div className="container mt-4">
      <button
        className="btn btn-outline-secondary mb-4"
        onClick={() => navigate("/campaignsboard")}
      >
>>>>>>> 21c7ef2 (haciendo el temporizador y el boton de google)
        ← Back to campaigns
      </button>

      <div className="card shadow">
        <div className="card-body">
          <h2>{campaign.name}</h2>

          <p><strong>Date:</strong> {campaign.event_date}</p>
          <p><strong>Location:</strong> {campaign.location}</p>

          {/* 🧪 DEBUG VISIBLE */}
          <div className="alert alert-warning">
            <strong>DEBUG</strong><br />
            role: {store?.user?.role}<br />
            isInscribed: {String(isInscribed)}<br />
            token in store: {String(Boolean(store?.token))}<br />
            token in localStorage: {String(Boolean(localStorage.getItem("token")))}
          </div>

          {/* ✅ COUNTDOWN + CALENDAR */}
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
>>>>>>> 21c7ef2 (haciendo el temporizador y el boton de google)
          )}
        </div>
      </div>
    </div>
  );
};
