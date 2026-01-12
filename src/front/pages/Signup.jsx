import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export const Signup = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("volunteer");

  // Organizer only
  const [orgName, setOrgName] = useState("");
  const [orgLink, setOrgLink] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const payload = {
      name,
      email: email.toLowerCase(),
      password,
      role,
    };

    if (role === "organizer") {
      payload.org_name = orgName;
      payload.org_link = orgLink;
    }

    try {
      const response = await fetch(`${backendUrl}/api/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.msg || "Signup failed");
        return;
      }

      alert("Account created successfully ✨");
      navigate("/login");
    } catch (error) {
      console.error(error);
      alert("Signup error");
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
          <div className="col-md-9 col-lg-7 col-xl-6">
            <div className="card border-0 shadow-lg rounded-4">
              <div className="card-body p-4 p-md-5">
                <h2
                  className="text-center mb-2 fw-bold"
                  style={{ color: "#2E8BC0" }}
                >
                  Create your account
                </h2>

                <p className="text-center text-muted mb-4">
                  Join Helping Souls and start making a difference
                </p>

                <form onSubmit={handleSubmit}>
                  {/* NAME */}
                  <div className="mb-3">
                    <label className="form-label">Name</label>
                    <input
                      type="text"
                      className="form-control rounded-pill px-3"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  {/* EMAIL */}
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control rounded-pill px-3"
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
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  {/* ROLE */}
                  <div className="mb-4">
                    <label className="form-label">I want to join as</label>
                    <select
                      className="form-select rounded-pill px-3"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                    >
                      <option value="volunteer">Volunteer</option>
                      <option value="organizer">Organization</option>
                    </select>
                  </div>

                  {/* ORGANIZER FIELDS */}
                  {role === "organizer" && (
                    <>
                      <div className="mb-3">
                        <label className="form-label">
                          Organization name
                        </label>
                        <input
                          type="text"
                          className="form-control rounded-pill px-3"
                          value={orgName}
                          onChange={(e) => setOrgName(e.target.value)}
                          required
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label">
                          Organization website
                        </label>
                        <input
                          type="url"
                          className="form-control rounded-pill px-3"
                          value={orgLink}
                          onChange={(e) => setOrgLink(e.target.value)}
                          required
                        />
                      </div>
                    </>
                  )}

                  {/* BUTTON */}
                  <div className="d-grid mt-4">
                    <button
                      type="submit"
                      className="btn rounded-pill py-2"
                      style={{
                        backgroundColor: "#2E8BC0",
                        color: "#fff",
                      }}
                    >
                      Create Account
                    </button>
                  </div>
                </form>

                {/* FOOTER */}
                <p className="text-center mt-4 text-muted">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="text-decoration-none"
                    style={{ color: "#48BB78" }}
                  >
                    Log in
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
