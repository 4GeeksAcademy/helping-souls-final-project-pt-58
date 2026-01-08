import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { EventInscriptions } from "../components/EventInscriptions";

export const DetailedCampaign = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { store } = useGlobalReducer();

  const [campaign, setCampaign] = useState(null);
  const [inscription, setInscription] = useState(null);
  const [isInscribed, setIsInscribed] = useState(false);
  const [isInterested, setIsInterested] = useState(false);
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

        const campaignRes = await fetch(`${backendUrl}/api/events/${id}`, {
          headers: { Authorization: `Bearer ${store.token}` },
        });

        if (!campaignRes.ok) throw new Error("Campaign not found");

        const campaignData = await campaignRes.json();
        setCampaign(campaignData.event);

        if (store.user?.role === "volunteer") {
          const inscriptionRes = await fetch(
            `${backendUrl}/api/events/${id}/inscription`,
            { headers: { Authorization: `Bearer ${store.token}` } }
          );

          const inscriptionData = await inscriptionRes.json();

          if (inscriptionData.isInscribed) {
            setIsInscribed(true);
            setInscription(inscriptionData.inscription);
          }

          const interestRes = await fetch(
            `${backendUrl}/api/events/${id}/interest`,
            { headers: { Authorization: `Bearer ${store.token}` } }
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

  const handleInterest = async () => {
    try {
      setInterestLoading(true);
      const backendUrl = import.meta.env.VITE_BACKEND_URL;

      const res = await fetch(`${backendUrl}/api/events/${id}/interest`, {
        method: "POST",
        headers: { Authorization: `Bearer ${store.token}` },
      });

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
        <div className="alert alert-danger">
          {error || "Campaign not found"}
        </div>
        <button className="btn btn-secondary" onClick={() => navigate("/campaignsboard")}>
          Back to campaigns
        </button>
      </div>
    );
  }

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

          {/* CATEGORY */}
          {campaign.category && (
            <div className="mb-3">
              <span className="badge bg-success">
                {campaign.category}
              </span>
            </div>
          )}

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


          <p><strong>Date:</strong> {campaign.event_date}</p>
          <p><strong>Location:</strong> {campaign.location}</p>
          <p><strong>Max volunteers:</strong> {campaign.max_volunteers ?? "Unlimited"}</p>

          {campaign.description && <p>{campaign.description}</p>}

          {store.user?.role === "organizer" && <EventInscriptions eventId={id} />}

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
          )}
        </div>
      </div>
    </div>
  );
};
