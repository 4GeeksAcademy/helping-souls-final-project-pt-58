import React, { useEffect, useState, useMemo } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const EventInscriptions = ({ eventId }) => {
  const { store } = useGlobalReducer();

  const [inscriptions, setInscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ===== FETCH INSCRIPTIONS ===== */
  const fetchInscriptions = async () => {
    try {
      setLoading(true);
      const backendUrl = import.meta.env.VITE_BACKEND_URL;

      const res = await fetch(
        `${backendUrl}/api/events/${eventId}/inscriptions`,
        {
          headers: {
            Authorization: `Bearer ${store.token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to load inscriptions");
      }

      const data = await res.json();
      setInscriptions(data.inscriptions || []);
    } catch (err) {
      console.error(err);
      setError("Error loading inscriptions");
    } finally {
      setLoading(false);
    }
  };

  /* ===== UPDATE STATUS ===== */
  const updateStatus = async (inscriptionId, status) => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;

      const res = await fetch(
        `${backendUrl}/api/inscriptions/${inscriptionId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${store.token}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to update status");
      }

      fetchInscriptions();
    } catch (err) {
      console.error(err);
      alert("Error updating inscription");
    }
  };

  /* ===== COUNTERS ===== */
  const approvedCount = useMemo(
    () => inscriptions.filter((i) => i.status === "approved").length,
    [inscriptions]
  );

  const pendingCount = useMemo(
    () => inscriptions.filter((i) => i.status === "pending").length,
    [inscriptions]
  );

  /* ===== EFFECT ===== */
  useEffect(() => {
    if (store.token && eventId) {
      fetchInscriptions();
    }
  }, [eventId, store.token]);

  /* ===== RENDER STATES ===== */
  if (loading) {
    return <p className="text-center mt-4">Loading inscriptions...</p>;
  }

  if (error) {
    return <div className="alert alert-danger mt-4">{error}</div>;
  }

  if (inscriptions.length === 0) {
    return (
      <div className="alert alert-secondary mt-4">
        No inscriptions yet for this campaign.
      </div>
    );
  }

  /* ===== RENDER ===== */
  return (
    <div className="mt-5">
      <h4 className="mb-3">Volunteer Applications</h4>

      {/* Counters */}
      <div className="d-flex gap-3 mb-3">
        <span className="badge bg-success">
          Approved: {approvedCount}
        </span>
        <span className="badge bg-warning text-dark">
          Pending: {pendingCount}
        </span>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered align-middle">
          <thead className="table-light">
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Document ID</th>
              <th>Message</th>
              <th>Status</th>
              <th>Contact</th>
              <th style={{ width: "160px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {inscriptions.map((item) => (
              <tr key={item.inscriptionID}>
                <td>{item.full_name}</td>
                <td>{item.email}</td>
                <td>{item.phone}</td>
                <td>{item.document_id}</td>
                <td>{item.message || "-"}</td>

                <td>
                  <span
                    className={`badge ${
                      item.status === "approved"
                        ? "bg-success"
                        : item.status === "rejected"
                        ? "bg-danger"
                        : "bg-warning text-dark"
                    }`}
                  >
                    {item.status}
                  </span>
                </td>

                {/* Contact column */}
                <td>
                  {item.status === "approved" && item.email ? (
                    <a
                      href={`mailto:${item.email}?subject=Campaign approval&body=Hello ${item.full_name},%0D%0A%0D%0AYou have been approved to participate in our campaign.`}
                      className="btn btn-sm btn-outline-primary"
                    >
                      Send Email
                    </a>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </td>

                {/* Actions */}
                <td>
                  {item.status === "pending" ? (
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() =>
                          updateStatus(item.inscriptionID, "approved")
                        }
                      >
                        Approve
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() =>
                          updateStatus(item.inscriptionID, "rejected")
                        }
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <span className="text-muted">No actions</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};