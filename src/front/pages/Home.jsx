import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

export const Home = () => {
  const { store, dispatch } = useGlobalReducer();
  const navigate = useNavigate();
  const isAuth = !!store?.token;

  const loadMessage = async () => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      if (!backendUrl) return;

      const response = await fetch(backendUrl + "/api/hello");
      const data = await response.json();

      if (response.ok) {
        dispatch({ type: "set_hello", payload: data.message });
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadMessage();
  }, []);

  return (
    <div>
      {/* HOME SECTION */}
      <section
        className="home-section d-flex align-items-center"
        style={{
          minHeight: "90vh",
          background:
            "linear-gradient(135deg, rgba(46,139,192,0.08), rgba(72,187,120,0.08))",
        }}
      >
        <div className="container">
          <div className="row align-items-center flex-column-reverse flex-md-row">
            {/* TEXT */}
            <div className="col-md-6 text-center text-md-start mt-4 mt-md-0">
              <h1 className="fw-bold mb-3" style={{ color: "#2E8BC0" }}>
                Together, we can make a difference
              </h1>

              <p className="text-muted fs-5 mb-4">
                Helping Souls connects volunteers and organizers to create real
                social impact through meaningful campaigns.
              </p>

              <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center justify-content-md-start">
                <button
                  className="btn px-4"
                  style={{
                    backgroundColor: "#2E8BC0",
                    color: "#fff",
                  }}
                  onClick={() => navigate("/campaignsboard")}
                >
                  Explore Campaigns
                </button>

                {!isAuth && (
                  <button
                    className="btn btn-outline-success px-4"
                    onClick={() => navigate("/signup")}
                  >
                    Join as Volunteer
                  </button>
                )}
              </div>
            </div>

            {/* IMAGE */}
            <div className="col-md-6 text-center">
              <img
                src="https://quiurevista.com/wp-content/uploads/2021/09/Voluntariado_Beneficios.jpg"
                alt="Volunteering together"
                className="img-fluid rounded shadow"
                style={{
                  width: "100%",
                  maxHeight: "520px",   
                  objectFit: "cover",
                }}
              />
            </div>

          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      {!isAuth && (
        <section
          className="py-5"
          style={{ backgroundColor: "#F4FBF8" }}
        >
          <div className="container text-center">
            <h4 className="mb-3">Ready to get involved?</h4>
            <p className="text-muted mb-4">
              Create an account and start helping causes that truly matter.
            </p>
            <button
              className="btn px-5"
              style={{
                backgroundColor: "#48BB78",
                color: "#fff",
              }}
              onClick={() => navigate("/signup")}
            >
              Create Account
            </button>
          </div>
        </section>
      )}
    </div>
  );
};
