import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { FormNewEvent } from "../components/Form_new_event";

export const EventsView = () => {
  const { store, dispatch } = useGlobalReducer();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");
  const storeUser = storedUser ? JSON.parse(storedUser) : null; // Obtener rol

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [form, setForm] = useState({
    name: "",
    event_date: "",
    location: "",
    category: "",
    max_volunteers: "",
    description: ""
  });

  const [image, setImage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  /* =========================
     RESTRICCIÓN POR ROL
  ========================= */
  useEffect(() => {
    if (!token || storeUser?.role !== "organizer") {
      setUnauthorized(true);

      const timer = setTimeout(() => {
        navigate("/campaignsboard"); // Redirige después de 5 segundos
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [navigate, token, storeUser]);

  /* =========================
     LOAD EVENTS
  ========================= */
  useEffect(() => {
    if (!token) return;

    fetch(`${backendUrl}/api/events`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        dispatch({ type: "set_events", payload: data.events || [] });
      })
      .catch(err => console.error("Fetch events error:", err));
  }, [token, dispatch, backendUrl]);

  /* =========================
     FORM HANDLERS
  ========================= */
  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* =========================
     CREATE EVENT
  ========================= */
  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => formData.append(key, value));
    if (image) formData.append("image", image);

    try {
      const response = await fetch(`${backendUrl}/api/new_events`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      const contentType = response.headers.get("content-type");

      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        throw new Error(text);
      }

      const data = await response.json();

      if (!response.ok) throw new Error(data.msg || "Error creating event");

      dispatch({ type: "add_event", payload: data.event });
      navigate("/campaignsboard");

    } catch (err) {
      console.error("Create event error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     DELETE EVENT
  ========================= */
  const handleDelete = eventID => {
    fetch(`${backendUrl}/api/events/${eventID}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      if (res.ok) dispatch({ type: "delete_event", payload: eventID });
    });
  };

  /* =========================
     RENDER
  ========================= */
  if (unauthorized) {
    return (
      <div className="container mt-5 text-center">
        <h3 className="text-danger mb-3">Access Denied</h3>
        <p>Only organizers can create events.</p>
        <p>Redirecting to Campaign Board </p>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h2>Create Event</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit} className="mb-4">
        <input
          className="form-control mb-2"
          name="name"
          placeholder="Event name"
          value={form.name}
          onChange={handleChange}
          required
        />

        <input
          type="date"
          className="form-control mb-2"
          name="event_date"
          value={form.event_date}
          onChange={handleChange}
          required
        />

        <input
          className="form-control mb-2"
          name="location"
          placeholder="Location"
          value={form.location}
          onChange={handleChange}
          required
        />

        <button
          type="button"
          className="form-control mb-2 text-start"
          onClick={() => setShowCategoryModal(true)}
        >
          {form.category ? `Category: ${form.category}` : "Select category"}
        </button>

        {showCategoryModal && (
          <div className="modal fade show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Select category</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowCategoryModal(false)}
                  />
                </div>
                <div className="modal-body">
                  {["Animals", "Environment", "Seniors", "Children", "Collection"].map(
                    cat => (
                      <button
                        key={cat}
                        className="btn btn-outline-primary w-100 mb-2"
                        onClick={() => {
                          setForm({ ...form, category: cat });
                          setShowCategoryModal(false);
                        }}
                      >
                        {cat}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <input
          type="number"
          className="form-control mb-2"
          name="max_volunteers"
          placeholder="Max volunteers"
          value={form.max_volunteers}
          onChange={handleChange}
          required
        />

        <textarea
          className="form-control mb-2"
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          required
        />

        <input
          type="file"
          className="form-control mb-3"
          accept="image/*"
          onChange={e => setImage(e.target.files[0])}
        />

        <button type="submit" className="btn btn-success" disabled={loading}>
          {loading ? "Creating..." : "Create Event"}
        </button>
      </form>

      <Link to="/campaignsboard" className="btn btn-outline-secondary mb-4">
        Back to Campaigns
      </Link>
    </div>
  );
};
