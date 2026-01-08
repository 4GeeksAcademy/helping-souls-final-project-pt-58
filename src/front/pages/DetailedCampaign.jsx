import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { EventInscriptions } from "../components/EventInscriptions";

export const DetailedCampaign = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { store } = useGlobalReducer();

  /* ===== STATES ===== */
  const [campaign, setCampaign] = useState(null);
  const [inscription, setInscription] = useState(null);
  const [isInscribed, setIsInscribed] = useState(false);
  const [isInterested, setIsInterested] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [interestLoading, setInterestLoading] = useState(false);

  /* ===== AUTH GUARD ===== */
  useEffect(() => {
    if (!store.token || !store.isAuth) {
      navigate("/login");
    }
  }, [store.token, store.isAuth, navigate]);

  /* ===== FETCH CAMPAIGN + STATUS ===== */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL;

        /* Obtener campaña */
        const campaignRes = await fetch(
          `${backendUrl}/api/events/${id}`,
          {
            headers: {
              Authorization: `Bearer ${store.token}`,
            },
          }
        );

        if (!campaignRes.ok) {
          throw new Error("Campaign not found");
        }

        const campaignData = await campaignRes.json();
        setCampaign(campaignData.event);

        /* Verificar inscripción (solo volunteer) */
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

          /* Verificar interés */
          const interestRes = await fetch(
            `${backendUrl}/api/events/${id}/interest`,
            {
              headers: {
                Authorization: `Bearer ${store.token}`,
              },
            }
          );

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

  /* ===== HANDLER: ME INTERESA ===== */
  const handleInterest = async () => {
    try {
      setInterestLoading(true);
      const backendUrl = import.meta.env.VITE_BACKEND_URL;

      const res = await fetch(
        `${backendUrl}/api/events/${id}/interest`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${store.token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to save interest");
      }

      setIsInterested(true);
    } catch (err) {
      console.error(err);
      alert("Error saving interest");
    } finally {
      setInterestLoading(false);
    }
  };

  /* ===== LOADING / ERROR ===== */
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
      {/* Back */}
      <button
        className="btn btn-outline-secondary mb-4"
        onClick={() => navigate("/campaignsboard")}
      >
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


          {/* Category */}
          {campaign.category && (
            <span className="badge bg-success mb-3">
              {campaign.category}
            </span>
          )}

          {/* Image */}
          {campaign.image && (
            <img
              src={`${import.meta.env.VITE_BACKEND_URL}/uploads/${campaign.image}`}
              alt={campaign.name}
              className="img-fluid rounded mb-3"
            />
          )}

          {/* Info */}
          <p><strong>Date:</strong> {campaign.event_date}</p>
          <p><strong>Location:</strong> {campaign.location}</p>
          <p>
            <strong>Max volunteers:</strong>{" "}
            {campaign.max_volunteers ?? "Unlimited"}
          </p>

          {/* Description */}
          {campaign.description && (
            <>
              <hr />
              <p>{campaign.description}</p>
            </>
          )}

          <hr />

          {/* ORGANIZER VIEW */}
          {store.user?.role === "organizer" && (
            <>
              <div className="alert alert-info">
                You are the organizer of this campaign.
              </div>

              <EventInscriptions eventId={id} />
            </>
          )}

          {/* VOLUNTEER VIEW */}
          {store.user?.role === "volunteer" && (
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
                      className="btn btn-outline-warning fw-semibold text-dark border-2"
                      onClick={handleInterest}
                      disabled={interestLoading}
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
