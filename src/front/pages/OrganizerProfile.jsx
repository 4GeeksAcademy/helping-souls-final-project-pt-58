import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export default function OrganizerProfile() {
  const { organizerID } = useParams();
  const navigate = useNavigate();
  const { store } = useGlobalReducer();

  const [organizer, setOrganizer] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Si no está logueado, manda al login (porque tus endpoints llevan @jwt_required)
  useEffect(() => {
    if (!store.token || !store.isAuth) navigate("/login");
  }, [store.token, store.isAuth, navigate]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const backendUrl = import.meta.env.VITE_BACKEND_URL;

        const res = await fetch(`${backendUrl}/api/organizers/${organizerID}`, {
          headers: { Authorization: `Bearer ${store.token}` }
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.msg || "Error loading organizer profile");
        }

        setOrganizer(data.organizer);
        setEvents(data.events || []);
      } catch (err) {
        console.error(err);
        setError(err.message || "Error loading organizer profile");
      } finally {
        setLoading(false);
      }
    };

    // evita llamar si aún no hay token
    if (store.token) fetchProfile();
  }, [organizerID, store.token]);

  if (loading) return <p className="text-center mt-4">Loading organizer...</p>;

  if (error || !organizer) {
    return (
      <div className="container mt-5 text-center">
        <div className="alert alert-danger">{error || "Organizer not found"}</div>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <button className="btn btn-outline-secondary mb-4" onClick={() => navigate(-1)}>
        ← Back
      </button>

      {/* Organizer header */}
      <div className="card shadow mb-4">
        <div className="card-body">
          <h2 className="mb-1">{organizer.name}</h2>

          {organizer.org_link && (
            <div className="mt-2">
              <a href={organizer.org_link} target="_blank" rel="noreferrer">
                Visit website
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Events list */}
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h3 className="mb-0">Published events</h3>
        <span className="badge bg-secondary">{events.length}</span>
      </div>

      {events.length === 0 ? (
        <div className="alert alert-info">This organizer has no events yet.</div>
      ) : (
        <div className="row g-3">
          {events.map((e) => (
            <div className="col-12 col-md-6 col-lg-4" key={e.eventID}>
              <div className="card h-100">
                {e.image && (
                  <img
                    src={e.image.replace("/upload/", "/upload/f_auto,q_auto,w_800/")}
                    className="card-img-top"
                    alt={e.name}
                    style={{ height: 180, objectFit: "cover" }}
                  />
                )}

                <div className="card-body">
                  <h5 className="card-title mb-1">{e.name}</h5>

                  <div className="small text-muted">
                    {e.event_date ? new Date(e.event_date).toLocaleDateString() : "No date"} •{" "}
                    {e.location || "No location"}
                  </div>

                  {e.category && (
                    <div className="mt-2">
                      <span className="badge bg-success">{e.category}</span>
                    </div>
                  )}

                  {e.description && <p className="mt-2 mb-0">{e.description}</p>}
                </div>

                <div className="card-footer bg-white">
                  {/* Link a tu detalle de campaña/evento */}
                  <Link to={`/campaigns/${e.eventID}`} className="btn btn-sm btn-outline-primary">
                    View details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
