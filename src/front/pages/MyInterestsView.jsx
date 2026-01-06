import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const MyInterestsView = () => {
  const navigate = useNavigate();
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInterests = async () => {
      const token = localStorage.getItem("token");
      const backendUrl = import.meta.env.VITE_BACKEND_URL;

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const res = await fetch(`${backendUrl}/api/my/interests`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Error fetching interests");

        const data = await res.json();
        setInterests(data.events || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load your interests.");
      } finally {
        setLoading(false);
      }
    };

    fetchInterests();
  }, [navigate]);

  const handleRemoveInterest = async (eventId) => {
    const token = localStorage.getItem("token");
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    try {
      await fetch(`${backendUrl}/api/events/${eventId}/interest`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      setInterests(interests.filter((e) => e.eventID !== eventId));
    } catch (err) {
      console.error("Error removing interest:", err);
    }
  };

  if (loading) return <p className="text-center mt-4">Loading your interests...</p>;
  if (error) return <p className="text-center text-danger mt-4">{error}</p>;
  if (interests.length === 0) return <p className="text-center mt-4">You have no interested campaigns.</p>;

  return (
    <div className="container mt-4">
      <h2 className="mb-4">My Interested Campaigns</h2>
      <div className="row">
        {interests.map((campaign) => (
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
              <div className="card-footer bg-transparent d-flex flex-column gap-2">
                <button
                  className="btn btn-outline-primary w-100"
                  onClick={() => navigate(`/campaigns/${campaign.eventID}`)}
                >
                  View Details
                </button>
                <button
                  className="btn btn-outline-danger w-100"
                  onClick={() => handleRemoveInterest(campaign.eventID)}
                >
                  Remove Interest
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};