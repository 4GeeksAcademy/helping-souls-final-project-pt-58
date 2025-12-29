import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const DetailedCampaign = () => {
    const { id } = useParams(); // eventID
    const navigate = useNavigate();
    const { store } = useGlobalReducer();

    /* ===== STATES ===== */
    const [campaign, setCampaign] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isInscribed, setIsInscribed] = useState(false);
    const [inscriptionStatus, setInscriptionStatus] = useState(null);

    const [showForm, setShowForm] = useState(false);
    const [message, setMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);

    /* ===== FETCH CAMPAIGN + INSCRIPTION ===== */
    useEffect(() => {
        if (!store.isAuth || !store.token) {
            navigate("/login");
            return;
        }

        const backendUrl = import.meta.env.VITE_BACKEND_URL;

        const fetchData = async () => {
            try {
                /* 1️⃣ Obtener campaña */
                const eventRes = await fetch(
                    `${backendUrl}/api/events/${id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${store.token}`,
                        },
                    }
                );

                if (!eventRes.ok) {
                    throw new Error("Campaign not found");
                }

                const eventData = await eventRes.json();
                setCampaign(eventData.event);

                /* 2️⃣ Verificar inscripción */
                const insRes = await fetch(
                    `${backendUrl}/api/events/${id}/inscription`,
                    {
                        headers: {
                            Authorization: `Bearer ${store.token}`,
                        },
                    }
                );

                if (insRes.ok) {
                    const insData = await insRes.json();
                    setIsInscribed(insData.isInscribed);
                    setInscriptionStatus(insData.status || null);
                }

            } catch (err) {
                console.error(err);
                setError("An error occurred while loading the campaign.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, store.isAuth, store.token, navigate]);

    /* ===== APPLY HANDLER ===== */
    const handleApply = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const backendUrl = import.meta.env.VITE_BACKEND_URL;

            const response = await fetch(
                `${backendUrl}/api/events/${id}/apply`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${store.token}`,
                    },
                    body: JSON.stringify({ message }),
                }
            );

            if (!response.ok) {
                throw new Error("Apply failed");
            }

            setIsInscribed(true);
            setInscriptionStatus("pending");
            setShowForm(false);

        } catch (err) {
            console.error(err);
            alert("Error applying to campaign");
        } finally {
            setSubmitting(false);
        }
    };

    /* ===== STATES ===== */
    if (loading) {
        return <p className="text-center mt-4">Loading campaign...</p>;
    }

    if (error) {
        return (
            <div className="container mt-5 text-center">
                <div className="alert alert-danger">{error}</div>
                <button
                    className="btn btn-secondary mt-3"
                    onClick={() => navigate("/campaignsboard")}
                >
                    Back to campaigns
                </button>
            </div>
        );
    }

    if (!campaign) return null;

    /* ===== MAIN VIEW ===== */
    return (
        <div className="container mt-4">
            {/* BACK */}
            <button
                className="btn btn-outline-secondary mb-4"
                onClick={() => navigate("/campaignsboard")}
            >
                ← Back to campaigns
            </button>

            <div className="card shadow">
                <div className="card-body">
                    <h2 className="card-title mb-3">{campaign.name}</h2>

                    {campaign.category && (
                        <span className="badge bg-success mb-3">
                            {campaign.category}
                        </span>
                    )}

                    <p>
                        <strong>Date:</strong>{" "}
                        {campaign.event_date || "Not specified"}
                    </p>

                    <p>
                        <strong>Location:</strong>{" "}
                        {campaign.location || "Not specified"}
                    </p>

                    <p>
                        <strong>Max volunteers:</strong>{" "}
                        {campaign.max_volunteers ?? "Unlimited"}
                    </p>

                    {campaign.description && (
                        <>
                            <hr />
                            <p>{campaign.description}</p>
                        </>
                    )}

                    <hr />

                    {/* ===== ACTIONS ===== */}
                    {store.user?.role === "volunteer" && (
                        <>
                            {isInscribed ? (
                                <div className="alert alert-success text-center">
                                    You are already registered
                                    <br />
                                    <strong>Status:</strong> {inscriptionStatus}
                                </div>
                            ) : (
                                <>
                                    {!showForm ? (
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => setShowForm(true)}
                                        >
                                            Me interesa
                                        </button>
                                    ) : (
                                        <form onSubmit={handleApply}>
                                            <div className="mb-3">
                                                <label className="form-label">
                                                    Message (optional)
                                                </label>
                                                <textarea
                                                    className="form-control"
                                                    rows="3"
                                                    value={message}
                                                    onChange={(e) =>
                                                        setMessage(e.target.value)
                                                    }
                                                />
                                            </div>

                                            <div className="d-flex gap-2">
                                                <button
                                                    type="submit"
                                                    className="btn btn-success"
                                                    disabled={submitting}
                                                >
                                                    {submitting ? "Submitting..." : "Submit"}
                                                </button>

                                                <button
                                                    type="button"
                                                    className="btn btn-outline-secondary"
                                                    onClick={() => setShowForm(false)}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    )}
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
