import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const EditCampaign = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { store } = useGlobalReducer();

  const [form, setForm] = useState({
    name: "",
    event_date: "",
    location: "",
    category: "",
    max_volunteers: "",
    description: ""
  });

  const [loading, setLoading] = useState(true);

  // Guard: solo organizer
  useEffect(() => {
    if (!store.token || !store.isAuth) navigate("/login");
    if (store.user?.role !== "organizer") navigate(`/campaigns/${id}`);
  }, [store.token, store.isAuth, store.user, navigate, id]);

  // Cargar evento
  useEffect(() => {
    const loadEvent = async () => {
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL;

        const res = await fetch(`${backendUrl}/api/events/${id}`, {
          headers: { Authorization: `Bearer ${store.token}` }
        });

        const data = await res.json();

        if (!res.ok) {
          alert(data.msg || "Error loading campaign");
          navigate("/campaignsboard");
          return;
        }

        const ev = data.event;

        setForm({
          name: ev.name || "",
          event_date: ev.event_date || "", // viene como "YYYY-MM-DD"
          location: ev.location || "",
          category: ev.category || "",
          max_volunteers: ev.max_volunteers ?? "",
          description: ev.description || ""
        });
      } catch (err) {
        console.error(err);
        alert("Error loading campaign");
      } finally {
        setLoading(false);
      }
    };

    if (store.token) loadEvent();
  }, [id, store.token, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;

      const res = await fetch(`${backendUrl}/api/events/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${store.token}`
        },
        body: JSON.stringify({
          ...form,
          max_volunteers:
            form.max_volunteers === "" ? null : Number(form.max_volunteers)
        })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.msg || "Error updating campaign");
        return;
      }

      // volver al detalle
      navigate(`/campaigns/${id}`);
    } catch (err) {
      console.error(err);
      alert("Error updating campaign");
    }
  };

  if (loading) return <p className="text-center mt-4">Loading edit form...</p>;

  return (
    <div className="container mt-4">
      <button
        className="btn btn-outline-secondary mb-3"
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>

      <div className="card shadow">
        <div className="card-body">
          <h3 className="mb-3">Edit Campaign</h3>

          <form onSubmit={handleSubmit}>
            <div className="mb-2">
              <label className="form-label">Name</label>
              <input
                className="form-control"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-2">
              <label className="form-label">Date</label>
              <input
                type="date"
                className="form-control"
                name="event_date"
                value={form.event_date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-2">
              <label className="form-label">Location</label>
              <input
                className="form-control"
                name="location"
                value={form.location}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-2">
              <label className="form-label">Category</label>
              <input
                className="form-control"
                name="category"
                value={form.category}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-2">
              <label className="form-label">Max volunteers</label>
              <input
                type="number"
                className="form-control"
                name="max_volunteers"
                value={form.max_volunteers}
                onChange={handleChange}
                min="0"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                name="description"
                rows="4"
                value={form.description}
                onChange={handleChange}
              />
            </div>

            <button className="btn btn-primary">Save changes</button>
          </form>
        </div>
      </div>
    </div>
  );
};
