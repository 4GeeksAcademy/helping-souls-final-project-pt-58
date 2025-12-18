import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const CampaignsBoard = () => {
  const navigate = useNavigate();

  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(true);

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
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error("Unauthorized");
        }

        const data = await response.json();
        setCampaigns(data.events);
      } catch (error) {
        console.error(error);
        setIsAuthorized(false);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  if (loading) {
    return <p className="text-center mt-4">Loading campaigns...</p>;
  }

  if (!isAuthorized) {
    return (
      <div className="container mt-5 text-center">
        <h4 className="mb-3">
          Please log in to access this portion of the site
        </h4>
        <button
          className="btn btn-primary"
          onClick={() => navigate("/login")}
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4 text-center">Campaigns Board</h2>

      <div className="row">
        {campaigns.map(campaign => (
          <div className="col-md-4 mb-4" key={campaign.eventID}>
            <div className="card h-100 shadow-sm text-center">
              <div className="card-body">
                <h5 className="card-title">{campaign.name}</h5>

                <span className="badge bg-success mb-2">
                  {campaign.category}
                </span>

                <p className="mb-1">
                  <strong>Date:</strong> {campaign.event_date}
                </p>

                <p className="mb-1">
                  <strong>Location:</strong> {campaign.location}
                </p>
              </div>

              <div className="card-footer bg-transparent">
                <button
                  className="btn btn-outline-primary w-100"
                  onClick={() => navigate("/")}
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};