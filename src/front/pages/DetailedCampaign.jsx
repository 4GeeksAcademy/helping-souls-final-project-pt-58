import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { EventInscriptions } from "../components/EventInscriptions";

// ✅ NUEVO
import EventCountdown from "../components/EventCountdown";
function yyyymmdd(dateStr) {
  return String(dateStr).slice(0, 10).replaceAll("-", "");
}

function addDays(dateStr, days) {
  const d = new Date(`${String(dateStr).slice(0, 10)}T00:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function buildGoogleCalendarUrl({ title, dateISO, description, location }) {
  const start = yyyymmdd(dateISO);
  const end = yyyymmdd(addDays(dateISO, 1)); // all-day end = next day

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

<<<<<<< HEAD
=======

  /* ===== STATES ===== */
>>>>>>> 21c7ef2 (haciendo el temporizador y el boton de google)
  const [campaign, setCampaign] = useState(null);
  const [inscription, setInscription] = useState(null);
  const [isInscribed, setIsInscribed] = useState(false);
  const [isInterested, setIsInterested] = useState(false);
<<<<<<< HEAD
=======
  
 console.log("role:", store.user?.role, "isInscribed:", isInscribed);

>>>>>>> 21c7ef2 (haciendo el temporizador y el boton de google)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [interestLoading, setInterestLoading] = useState(false);

  useEffect(() => {
    if (!store.token || !store.isAuth) navigate("/login");
  }, [store.token, store.isAuth, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL;

<<<<<<< HEAD
        const campaignRes = await fetch(`${backendUrl}/api/events/${id}`, {
          headers: { Authorization: `Bearer ${store.token}` },
=======
        /* Obtener campaña */
        const campaignRes = await fetch(`${backendUrl}/api/events/${id}`, {
          headers: {
            Authorization: `Bearer ${store.token}`,
          },
>>>>>>> 21c7ef2 (haciendo el temporizador y el boton de google)
        });

        if (!campaignRes.ok) throw new Error("Campaign not found");

        const campaignData = await campaignRes.json();
        setCampaign(campaignData.event);

        if (store.user?.role === "volunteer") {
<<<<<<< HEAD
          const inscriptionRes = await fetch(
            `${backendUrl}/api/events/${id}/inscription`,
            { headers: { Authorization: `Bearer ${store.token}` } }
          );
=======
          const inscriptionRes = await fetch(`${backendUrl}/api/events/${id}/inscription`, {
            headers: {
              Authorization: `Bearer ${store.token}`,
            },
          });
>>>>>>> 21c7ef2 (haciendo el temporizador y el boton de google)

          const inscriptionData = await inscriptionRes.json();

          if (inscriptionData.isInscribed) {
            setIsInscribed(true);
            setInscription(inscriptionData.inscription);
          }

<<<<<<< HEAD
          const interestRes = await fetch(
            `${backendUrl}/api/events/${id}/interest`,
            { headers: { Authorization: `Bearer ${store.token}` } }
          );
=======
          /* Verificar interés */
          const interestRes = await fetch(`${backendUrl}/api/events/${id}/interest`, {
            headers: {
              Authorization: `Bearer ${store.token}`,
            },
          });
>>>>>>> 21c7ef2 (haciendo el temporizador y el boton de google)

          const interestData = await interestRes.json();
          setIsInterested(interestData.isInterested);
        }
      } catch (err) {
        console.error(err);
        setError("Error loading campaign details");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, store.token, store.user]);

  const handleInterest = async () => {
    try {
      setInterestLoading(true);
      const backendUrl = import.meta.env.VITE_BACKEND_URL;

      const res = await fetch(`${backendUrl}/api/events/${id}/interest`, {
        method: "POST",
<<<<<<< HEAD
        headers: { Authorization: `Bearer ${store.token}` },
      });
=======
        headers: {
          Authorization: `Bearer ${store.token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to save interest");
      }
>>>>>>> 21c7ef2 (haciendo el temporizador y el boton de google)

      if (!res.ok) throw new Error("Failed to save interest");
      setIsInterested(true);
    } catch (err) {
      alert("Error saving interest");
    } finally {
      setInterestLoading(false);
    }
  };

  if (loading) return <p className="text-center mt-4">Loading campaign...</p>;

  if (error || !campaign) {
    return (
      <div className="container mt-5 text-center">
<<<<<<< HEAD
        <div className="alert alert-danger">
          {error || "Campaign not found"}
        </div>
=======
        <div className="alert alert-danger">{error || "Campaign not found"}</div>
>>>>>>> 21c7ef2 (haciendo el temporizador y el boton de google)
        <button className="btn btn-secondary" onClick={() => navigate("/campaignsboard")}>
          Back to campaigns
        </button>
      </div>
    );
  }

<<<<<<< HEAD
  return (
    <div className="container mt-4">
      <button
        className="btn btn-outline-secondary mb-4"
        onClick={() => navigate("/campaignsboard")}
      >
=======
  // ✅ NUEVO: url para Google Calendar (solo si hay fecha)
  const gcalUrl = campaign?.event_date
    ? buildGoogleCalendarUrl({
        title: campaign.name,
        dateISO: campaign.event_date,
        description: campaign.description,
        location: campaign.location,
      })
    : null;

  /* ===== MAIN VIEW ===== */
  return (
    <div className="container mt-4">
      {/* Back */}
      <button className="btn btn-outline-secondary mb-4" onClick={() => navigate("/campaignsboard")}>
>>>>>>> 21c7ef2 (haciendo el temporizador y el boton de google)
        ← Back to campaigns
      </button>

      <div className="card shadow">
        <div className="card-body">
          {/* Title */}
          <div className="d-flex justify-content-between align-items-start">
            <h2 className="card-title mb-2">{campaign.name}</h2>

            {store.user?.role === "organizer" && (
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={() => navigate(`/campaigns/${id}/edit`)}
                title="Edit campaign"
              >
                ✏️ Edit
              </button>
            )}
          </div>
          {campaign.organizerID && (
            <div className="mb-2">
              <small className="text-muted">
                Organizer:{" "}
                <Link to={`/profile/organizer/${campaign.organizerID}`} className="text-decoration-none">
                  {campaign.organizer_name || "View organizer profile"}
                </Link>
              </small>
            </div>
          )}

<<<<<<< HEAD
          {/* CATEGORY */}
          {campaign.category && (
            <div className="mb-3">
              <span className="badge bg-success">
                {campaign.category}
              </span>
            </div>
          )}
=======
          {/* Category */}
          {campaign.category && <span className="badge bg-success mb-3">{campaign.category}</span>}
>>>>>>> 21c7ef2 (haciendo el temporizador y el boton de google)

          {/* IMAGE */}
          {campaign.image && (
            <div className="mb-4">
              <img
                src={campaign.image.replace("/upload/", "/upload/f_auto,q_auto,w_800/")}
                alt={campaign.name}
                className="img-fluid rounded shadow-sm"
                style={{
                  maxWidth: "600px",
                  width: "100%",
                  height: "auto"
                }}
              />
            </div>
          )}

<<<<<<< HEAD

          <p><strong>Date:</strong> {campaign.event_date}</p>
          <p><strong>Location:</strong> {campaign.location}</p>
          <p><strong>Max volunteers:</strong> {campaign.max_volunteers ?? "Unlimited"}</p>
=======
          {/* Info */}
          <p>
            <strong>Date:</strong> {campaign.event_date}
          </p>
          <p>
            <strong>Location:</strong> {campaign.location}
          </p>
          <p>
            <strong>Max volunteers:</strong> {campaign.max_volunteers ?? "Unlimited"}
          </p>
>>>>>>> 21c7ef2 (haciendo el temporizador y el boton de google)

          {campaign.description && <p>{campaign.description}</p>}

          {store.user?.role === "organizer" && <EventInscriptions eventId={id} />}

<<<<<<< HEAD
          {store.user?.role === "volunteer" && (
            !isInscribed ? (
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
                You are already registered — Status: {inscription.status}
              </div>
            )
=======
          {/* ORGANIZER VIEW */}
          {store.user?.role === "organizer" && (
            <>
              <div className="alert alert-info">You are the organizer of this campaign.</div>
              <EventInscriptions eventId={id} />
            </>
          )}

          {/* VOLUNTEER VIEW */}
          {store.user?.role === "volunteer" && (
            <>
              {!isInscribed ? (
                <div className="d-flex gap-2">
                  <button className="btn btn-primary" onClick={() => navigate(`/campaigns/${id}/apply`)}>
                    Register
                  </button>

                  {!isInterested ? (
                    <button
                      className="btn btn-outline-warning fw-semibold text-dark border-2"
                      onClick={handleInterest}
                      disabled={interestLoading}
                    >
                      {interestLoading ? "Saving..." : "Save for later"}
                    </button>
                  ) : (
                    <span className="badge bg-warning text-dark align-self-center">Saved in My Interests</span>
                  )}
                </div>
              ) : (
                <>
                  <div className="alert alert-success">
                    <strong>You are already registered</strong>
                    <br />
                    Status: <strong>{inscription?.status}</strong>
                  </div>

                  {/* ✅ NUEVO: Countdown */}
                  <EventCountdown eventDateISO={campaign.event_date} />

                  {/* ✅ NUEVO: Google Calendar */}
                  {gcalUrl && (
                    <a className="btn btn-primary mt-2" href={gcalUrl} target="_blank" rel="noreferrer">
                      Add to Google Calendar
                    </a>
                  )}
                </>
              )}
            </>
>>>>>>> 21c7ef2 (haciendo el temporizador y el boton de google)
          )}
        </div>
      </div>
    </div>
  );
};
