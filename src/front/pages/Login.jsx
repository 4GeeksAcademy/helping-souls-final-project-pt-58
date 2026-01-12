import { useContext, useState } from "react";
import { StoreContext } from "../hooks/useGlobalReducer";
import { useNavigate, Link } from "react-router-dom";

export const Login = () => {
  const { dispatch } = useContext(StoreContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    try {
      const resp = await fetch(`${backendUrl}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.toLowerCase(),
          password,
        }),
      });

      const data = await resp.json();

      if (!resp.ok) {
        alert(data.msg || "Invalid email or password");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      dispatch({
        type: "login_success",
        payload: {
          token: data.token,
          user: data.user,
        },
      });

      navigate("/campaignsboard");
    } catch (error) {
      alert("Connection error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      className="d-flex align-items-center"
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, rgba(46,139,192,0.08), rgba(72,187,120,0.08))",
      }}
    >
      <div className="container">
        <div className="row justify-content-center">
          {/* MISMO ANCHO QUE SIGNUP */}
          <div className="col-md-8 col-lg-6 col-xl-5">
            <div className="card border-0 shadow-lg rounded-4">
              <div className="card-body p-4 p-md-5">
                <h2
                  className="text-center mb-2 fw-bold"
                  style={{ color: "#2E8BC0" }}
                >
                  Welcome back
                </h2>

                <p className="text-center text-muted mb-4">
                  Log in to continue helping others
                </p>

                <form onSubmit={handleSubmit}>
                  {/* EMAIL */}
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control rounded-pill px-3"
                      placeholder="email@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  {/* PASSWORD */}
                  <div className="mb-3">
                    <label className="form-label">Password</label>
                    <input
                      type="password"
                      className="form-control rounded-pill px-3"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  {/* BUTTON */}
                  <div className="d-grid mt-4">
                    <button
                      type="submit"
                      className="btn rounded-pill py-2"
                      style={{
                        backgroundColor: "#2E8BC0",
                        color: "#fff",
                      }}
                      disabled={loading}
                    >
                      {loading ? "Logging in..." : "Log in"}
                    </button>
                  </div>
                </form>

                {/* FOOTER */}
                <p className="text-center mt-4 text-muted">
                  Don’t have an account?{" "}
                  <Link
                    to="/signup"
                    className="text-decoration-none"
                    style={{ color: "#48BB78" }}
                  >
                    Sign up instead
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
