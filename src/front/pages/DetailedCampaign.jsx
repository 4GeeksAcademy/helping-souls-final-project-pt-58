import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { EventInscriptions } from "../components/EventInscriptions";

export const DetailedCampaign = () => {
  const { id } = useParams(); // eventID
  const navigate = useNavigate();
  const { store } = useGlobalReducer();

  /* ===== STATES ===== */
  const [campaign, setCampaign] = useState(null);
  const [inscription, setInscription] = useState(null);
  const [isInscribed, setIsInscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ===== AUTH GUARD ===== */
  useEffect(() => {
    if (!store.isAuth || !store.token) {
      navigate("/login");
    }
  }, [store.isAuth, store.token, navigate]);

  /* ===== FETCH CAMPAIGN + INSCRIPTION ===== */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL;

        // 1️⃣ Obtener campaña
        const campaignRes = await fetch(
          `${backendUrl}/api/events/${id}`,
          {
            headers: {
              Authorization: `Bearer ${store.token}`,
            },
          }
        );

        if (!campaignRes.ok) throw new Error("Campaign not found");

        const campaignData = await campaignRes.json();
        setCampaign(campaignData.event);

        // 2️⃣ Verificar inscripción (solo voluntarios)
        if (store.user?.role === "volunteer") {
          const inscriptionRes = await fetch(
            `${backendUrl}/api/events/${id}/inscription`,
            {
              headers: {
                Authorization: `Bearer ${store.token}`,
              },
            }
          );

          const inscriptionData = await inscriptionRes.json();

          if (inscriptionData.isInscribed) {
            setIsInscribed(true);
            setInscription(inscriptionData.inscription);
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
  }, [id, store.token, store.user]);

  /* ===== STATES ===== */
  if (loading) {
    return <p className="text-center mt-4">Loading campaign...</p>;
  }

  if (error || !campaign) {
    return (
      <div className="container mt-5 text-center">
        <div className="alert alert-danger">
          {error || "Campaign not found"}
        </div>
        <button
          className="btn btn-secondary"
          onClick={() => navigate("/campaignsboard")}
        >
          Back to campaigns
        </button>
      </div>
    );
  }

  /* ===== MAIN VIEW ===== */
  return (
    <div className="container mt-4">

      {/* ===== BACK BUTTON ===== */}
      <button
        className="btn btn-outline-secondary mb-4"
        onClick={() => navigate("/campaignsboard")}
      >
        ← Back to campaigns
      </button>

      <div className="card shadow">
        <div className="card-body">

          {/* ===== TITLE ===== */}
          <h2 className="card-title mb-2">{campaign.name}</h2>

          {/* ===== CATEGORY ===== */}
          {campaign.category && (
            <span className="badge bg-success mb-3">
              {campaign.category}
            </span>
          )}

          {/* ===== INFO ===== */}
          <p><strong>Date:</strong> {campaign.event_date}</p>
          <p><strong>Location:</strong> {campaign.location}</p>
          <p>
            <strong>Max volunteers:</strong>{" "}
            {campaign.max_volunteers ?? "Unlimited"}
          </p>

          {/* ===== DESCRIPTION ===== */}
          {campaign.description && (
            <>
              <hr />
              <p>{campaign.description}</p>
            </>
          )}

          {/* ===== ACTIONS ===== */}
          <hr />

          {/*  ORGANIZER */}
          {store.user?.role === "organizer" && (
            <>
              <div className="alert alert-info">
                You are the organizer of this campaign.
              </div>

              <EventInscriptions eventId={campaign.eventID} />
            </>
          )}

          {/*  VOLUNTEER */}
          {store.user?.role === "volunteer" && (
            <>
              {!isInscribed ? (
                <button
                  className="btn btn-primary"
                  onClick={() =>
                    navigate(`/campaigns/${id}/apply`)
                  }
                >
                  Inscribirse
                </button>
              ) : (
                <div className="alert alert-success">
                  <strong>You are already registered</strong>
                  <br />
                  Status: <strong>{inscription.status}</strong>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};