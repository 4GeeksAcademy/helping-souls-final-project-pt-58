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
                    password
                })
            });

            const data = await resp.json();

            if (!resp.ok) {
                alert(data.msg || "Email o contraseña inválidos");
                setLoading(false);
                return;
            }

            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            dispatch({
                type: "login_success",
                payload: {
                    token: data.token,
                    user: data.user
                }
            });

            navigate("/campaignsboard");
        } catch (error) {
            alert("Error de conexión");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-5 col-lg-4">
                    <div className="card shadow-sm">
                        <div className="card-body">
                            <h3 className="card-title text-center mb-4">
                                Log in
                            </h3>

                            <form onSubmit={handleSubmit}>
                                {/* Email */}
                                <div className="mb-3">
                                    <label className="form-label">Email</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        placeholder="email@email.com"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        required
                                    />
                                </div>

                                {/* Password */}
                                <div className="mb-3">
                                    <label className="form-label">Password</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="d-grid">
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={loading}
                                    >
                                        {loading ? "Ingresando..." : "Login"}
                                    </button>
                                </div>
                            </form>
                            {/* Sign up link */}
                            <div className="text-center mt-3">
                                <p className="mb-1">Don’t have an account?</p>
                                <Link to="/signup" className="text-decoration-none fw-semibold">
                                    Sign up instead
                                </Link>
                            </div>


                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};