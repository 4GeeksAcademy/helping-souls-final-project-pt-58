import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const EventsView = () => {
  const { dispatch } = useGlobalReducer();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");
  const storeUser = storedUser ? JSON.parse(storedUser) : null;

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    name: "",
    event_date: "",
    event_time: "",
    city: "",
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
        navigate("/campaignsboard");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [navigate, token, storeUser]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* =========================
     CREATE EVENT
  ========================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) =>
      formData.append(key, value)
    );
    if (image) formData.append("image", image);

    try {
      const response = await fetch(`${backendUrl}/api/new_events`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.msg || "Error creating event");

      dispatch({ type: "add_event", payload: data.event });
      navigate("/campaignsboard");
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     UNAUTHORIZED VIEW
  ========================= */
  if (unauthorized) {
    return (
      <div className="container mt-5 text-center">
        <h3 className="text-danger mb-3">Access Denied</h3>
        <p>Only organizers can create events.</p>
        <p>Redirecting to Campaign Board…</p>
      </div>
    );
  }

  /* =========================
     RENDER
  ========================= */
  return (
    <section
      className="w-100 d-flex justify-content-center align-items-center"
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, rgba(46,139,192,0.08), rgba(72,187,120,0.08))"
      }}
    >
      {/* FULL WIDTH WRAPPER */}
      <div
        className="card border-0 shadow-lg rounded-4"
        style={{
          width: "100%",
          maxWidth: "1200px",
          margin: "2rem"
        }}
      >
        <div className="card-body p-4 p-md-5">

          <h2
            className="text-center fw-bold mb-2"
            style={{ color: "#2E8BC0" }}
          >
            Create Event
          </h2>

          <p className="text-center text-muted mb-4">
            Share your initiative and find volunteers
          </p>

          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit}>
            {/* EVENT NAME */}
            <div className="mb-3">
              <label className="form-label">Event name</label>
              <input
                className="form-control rounded-pill px-3"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
            {/* CITY */}
            <div className="mb-3">
              <label className="form-label">City</label>
              <input
                className="form-control rounded-pill px-3"
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="e.g. Bogotá"
                required
              />
            </div>

            {/* LOCATION + MAP */}
            <div className="mb-3">
              <label className="form-label">Exact address / Location</label>
              <input
                className="form-control rounded-pill px-3"
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="Street, neighborhood, reference point"
                required
              />

              {form.location.length > 3 && (
                <div className="mt-2">
                  <iframe
                    title="map-preview"
                    width="100%"
                    height="180"
                    className="rounded border"
                    src={`https://www.google.com/maps?q=${encodeURIComponent(
                      `${form.location}, ${form.city}`
                    )}&output=embed`}
                  />
                </div>
              )}
            </div>

            {/* EVENT DATE */}
            <div className="mb-3">
              <label className="form-label">Event date</label>
              <input
                type="date"
                className="form-control rounded-pill px-3"
                name="event_date"
                value={form.event_date}
                onChange={handleChange}
                min={today}
                required
              />
            </div>

            {/* EVENT TIME */}
            <div className="mb-3">
              <label className="form-label">Event time</label>
              <input
                type="time"
                className="form-control rounded-pill px-3"
                name="event_time"
                value={form.event_time}
                onChange={handleChange}
                required
              />
            </div>

            {/* CATEGORY */}
            <div className="mb-3">
              <label className="form-label">Category</label>
              <button
                type="button"
                className="form-control rounded-pill text-start px-3"
                onClick={() => setShowCategoryModal(true)}
              >
                {form.category || "Select category"}
              </button>
            </div>

            {/* CATEGORY MODAL */}
            {showCategoryModal && (
              <div className="modal fade show d-block" tabIndex="-1">
                <div className="modal-dialog modal-dialog-centered">
                  <div className="modal-content rounded-4">
                    <div className="modal-header">
                      <h5 className="modal-title">Select category</h5>
                      <button
                        className="btn-close"
                        onClick={() => setShowCategoryModal(false)}
                      />
                    </div>
                    <div className="modal-body">
                      {["Animals", "Environment", "Seniors", "Children", "Collection"].map(cat => (
                        <button
                          key={cat}
                          type="button"
                          className="btn btn-outline-primary w-100 mb-2 rounded-pill"
                          onClick={() => {
                            setForm({ ...form, category: cat });
                            setShowCategoryModal(false);
                          }}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* MAX VOLUNTEERS */}
            <div className="mb-3">
              <label className="form-label">Max volunteers</label>
              <input
                type="number"
                className="form-control rounded-pill px-3"
                name="max_volunteers"
                value={form.max_volunteers}
                onChange={handleChange}
                required
              />
            </div>

            {/* DESCRIPTION */}
            <div className="mb-3">
              <label className="form-label">Description</label>
              <textarea
                className="form-control rounded-4 px-3"
                rows="4"
                name="description"
                value={form.description}
                onChange={handleChange}
                required
              />
            </div>

            {/* IMAGE */}
            <div className="mb-4">
              <label className="form-label">Event image</label>
              <input
                type="file"
                className="form-control rounded-pill px-3"
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
              />
            </div>

            {/* SUBMIT */}
            <div className="d-grid">
              <button
                type="submit"
                className="btn rounded-pill py-2"
                style={{ backgroundColor: "#2E8BC0", color: "#fff" }}
                disabled={loading}
              >
                {loading ? "Creating…" : "Create Event"}
              </button>
            </div>
          </form>

          <p className="text-center mt-4">
            <Link
              to="/campaignsboard"
              className="text-decoration-none"
              style={{ color: "#48BB78" }}
            >
              Back to campaigns
            </Link>
          </p>

        </div>
      </div>
    </section>
  );

};
