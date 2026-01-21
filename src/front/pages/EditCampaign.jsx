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
    event_time: "",
    city: "",
    location: "",
    category: "",
    max_volunteers: "",
    description: ""
  });

  const [loading, setLoading] = useState(true);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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
          event_date: ev.event_date || "",
          event_time: ev.event_time || "",
          city: ev.city || "",
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

      navigate(`/campaigns/${id}`);
    } catch (err) {
      console.error(err);
      alert("Error updating campaign");
    }
  };

  const handleDelete = async () => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;

      const res = await fetch(`${backendUrl}/api/events/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${store.token}`
        }
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.msg || "Error deleting campaign");
        return;
      }

      setShowDeleteModal(false);
      navigate("/campaignsboard");
    } catch (err) {
      console.error(err);
      alert("Error deleting campaign");
    }
  };

  if (loading) return <p className="text-center mt-4">Loading edit form...</p>;

  return (
    <div className="container mt-4">

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
              <label className="form-label">Time</label>
              <input
                type="time"
                className="form-control"
                name="event_time"
                value={form.event_time}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-2">
              <label className="form-label">City</label>
              <input
                className="form-control"
                name="city"
                value={form.city}
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
                <div className="modal-dialog modal-dialog-centered modal-sm">
                  <div className="modal-content rounded-3 shadow">
                    {/* Header */}
                    <div className="modal-header border-0 pb-1">
                      <h5 className="modal-title fw-semibold fs-6">
                        Select a category
                      </h5>
                      <button
                        className="btn-close btn-sm"
                        onClick={() => setShowCategoryModal(false)}
                      />
                    </div>

                    {/* Body */}
                    <div className="modal-body pt-2 pb-3 p-2">
                      <div className="d-grid gap-2">
                        {["Animals", "Environment", "Seniors", "Children", "Collection"].map(cat => (
                          <button
                            key={cat}
                            type="button"
                            className="btn btn-outline-primary btn-sm rounded-pill fw-medium text-start"
                            onClick={() => {
                              setForm(prev => ({ ...prev, category: cat }));
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
              </div>
            )}

            <div className="mb-2">
              <label className="form-label">Max volunteers</label>
              <input
                type="number"
                className="form-control"
                name="max_volunteers"
                value={form.max_volunteers}
                min="0"
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "" || Number(value) >= 0) {
                    setForm(prev => ({ ...prev, max_volunteers: value }));
                  }
                }}
                onKeyDown={(e) => {
                  if (["-", "e", "E", "+"].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
                onWheel={(e) => e.target.blur()}
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

            <div className="d-flex justify-content-between align-items-center mt-4">
              <button
                type="submit"
                className="btn btn-primary px-4"
              >
                Save changes
              </button>

              <button
                type="button"
                className="btn btn-delete-danger btn-sm px-3"
                onClick={() => setShowDeleteModal(true)}
              >
                Delete campaign
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div className="modal fade show d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border border-danger">
              <div className="modal-header">
                <h5 className="modal-title text-danger">
                  ⚠️ Delete campaign
                </h5>
                <button
                  className="btn-close"
                  onClick={() => setShowDeleteModal(false)}
                />
              </div>

              <div className="modal-body">
                <p className="fw-semibold">
                  This action is <span className="text-danger">irreversible</span>.
                </p>
                <p>
                  Deleting this campaign will permanently remove it and all its data.
                </p>
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>

                <button
                  className="btn btn-delete-danger"
                  onClick={handleDelete}
                >
                  Yes, delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
