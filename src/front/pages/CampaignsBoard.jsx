import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const CampaignsBoard = () => {
  const navigate = useNavigate(); // Hook de React Router para navegar entre rutas

  // ===== ESTADOS LOCALES =====
  const [campaigns, setCampaigns] = useState([]); // Lista de campañas a mostrar
  const [loading, setLoading] = useState(true); // Indica si los datos están cargando
  const [isAuthorized, setIsAuthorized] = useState(true); // Controla acceso según token/rol
  const [error, setError] = useState(null); // Para mostrar errores del backend o fetch

  // ===== OBTENER USUARIO DEL LOCALSTORAGE =====
  // Esto nos permitirá saber el rol del usuario y decidir si mostrar el botón de crear campaña
  const storedUser = localStorage.getItem("user");
  const storeUser = storedUser ? JSON.parse(storedUser) : null; // Convierte string JSON a objeto

  // ===== USEEFFECT: CARGA DE CAMPAÑAS =====
  useEffect(() => {
    const token = localStorage.getItem("token"); // Obtener token del localStorage

    // Si no hay token, no está autorizado
    if (!token) {
      setIsAuthorized(false);
      setLoading(false);
      return;
    }

    // Función para obtener campañas desde backend
    const fetchCampaigns = async () => {
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL; // URL del backend

        const response = await fetch(`${backendUrl}/api/events`, {
          headers: {
            Authorization: `Bearer ${token}`, // Enviamos token JWT para validar sesión
          },
        });

        //  Manejo de respuestas de autorización
        if (response.status === 401 || response.status === 403) {
          throw new Error("Unauthorized"); // Usuario no autorizado
        }

        // Manejo de otros errores del backend
        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || "Server error");
        }

        const data = await response.json(); // Convertimos respuesta a JSON
        setCampaigns(data.events || []); // Guardamos campañas en el estado
      } catch (err) {
        console.error("Fetch campaigns error:", err);

        // Si el error es de autorización, bloqueamos acceso
        if (err.message === "Unauthorized") {
          setIsAuthorized(false);
        } else {
          setError("An error occurred while loading campaigns."); // Error genérico
        }
      } finally {
        setLoading(false); // Terminó la carga
      }
    };

    fetchCampaigns(); // Ejecutamos la función de fetch
  }, [navigate]);

  /* =========================
       RENDER ESTADOS ESPECIALES
     ========================= */

  // Mientras cargan los datos
  if (loading) {
    return <p className="text-center mt-4">Loading campaigns...</p>;
  }

  // Si el usuario no está autorizado
  if (!isAuthorized) {
    return (
      <div className="container mt-5 text-center">
        <h4 className="mb-3">
          Please log in to access this portion of the site
        </h4>
        <button
          className="btn btn-primary"
          onClick={() => navigate("/login")} // Redirige al login
        >
          Go to Login
        </button>
      </div>
    );
  }

  // Si hubo un error al cargar datos
  if (error) {
    return (
      <div className="container mt-5 text-center">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  /* =========================
       MAIN VIEW: MOSTRAR CAMPAÑAS
     ========================= */

  return (
    <div className="container mt-4">
      {/* ===== HEADER Y BOTÓN DE CREAR ===== */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Campaigns Board</h2>

        {/*  Mostrar botón solo si el usuario es organizer */}
        {storeUser?.role === "organizer" && (
          <button
            className="btn btn-success"
            onClick={() => navigate("/events")} // Redirige a página de creación
          >
            Create Campaign
          </button>
        )}
      </div>

      {/* ===== GRID DE CAMPAÑAS ===== */}
      {campaigns.length === 0 ? (
        <p className="text-center">No campaigns available</p> // Mensaje si no hay campañas
      ) : (
        <div className="row">
          {campaigns.map((campaign) => (
            <div className="col-md-4 mb-4" key={campaign.eventID}>
              <div className="card h-100 shadow-sm text-center">
                <div className="card-body">
                  <h5 className="card-title">{campaign.name}</h5>

                  {/* Mostrar categoría si existe */}
                  {campaign.category && (
                    <span className="badge bg-success mb-2">
                      {campaign.category}
                    </span>
                  )}

                  {/* Mostrar fecha si existe */}
                  {campaign.event_date && (
                    <p className="mb-1">
                      <strong>Date:</strong> {campaign.event_date}
                    </p>
                  )}

                  {/* Mostrar ubicación */}
                  <p className="mb-1">
                    <strong>Location:</strong> {campaign.location}
                  </p>
                </div>

                {/* Botón para ver detalles de campaña */}
                <div className="card-footer bg-transparent">
                  <button
                    className="btn btn-outline-primary w-100"
                    onClick={() => navigate(`/campaigns/${campaign.eventID}`)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
