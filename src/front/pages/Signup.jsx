import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export const Signup = () => {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("volunteer");

    // solo organizer
    const [orgName, setOrgName] = useState("");
    const [orgLink, setOrgLink] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        const backendUrl = import.meta.env.VITE_BACKEND_URL;

        const payload = {
            name,
            email: email.toLowerCase(),
            password,
            role
        };

        if (role === "organizer") {
            payload.org_name = orgName;
            payload.org_link = orgLink;
        }

        try {
            const response = await fetch(`${backendUrl}/api/signup`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.msg || "Signup failed");
                return;
            }

            alert("Usuario creado con éxito, ahora inicia sesión");
            navigate("/login");

        } catch (error) {
            console.error("Signup error:", error);
            alert("Error al registrarse");
        }
    };

    return (
        <div className="container mt-4">
            <h1>Registrate</h1>

            <form onSubmit={handleSubmit}>
                {/* Nombre */}
                <div className="mb-3">
                    <label className="form-label">Nombre</label>
                    <input
                        type="text"
                        className="form-control"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>

                {/* Email */}
                <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                        type="email"
                        className="form-control"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                {/* Password */}
                <div className="mb-3">
                    <label className="form-label">Contraseña</label>
                    <input
                        type="password"
                        className="form-control"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                {/* Rol */}
                <div className="mb-3">
                    <label className="form-label">Rol</label>
                    <select
                        className="form-select"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                    >
                        <option value="volunteer">Voluntario</option>
                        <option value="organizer">Organizador</option>
                    </select>
                </div>

                {/* Campos solo para organizer */}
                {role === "organizer" && (
                    <>
                        <div className="mb-3">
                            <label className="form-label">Nombre de la organización</label>
                            <input
                                type="text"
                                className="form-control"
                                value={orgName}
                                onChange={(e) => setOrgName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Link de la organización</label>
                            <input
                                type="url"
                                className="form-control"
                                value={orgLink}
                                onChange={(e) => setOrgLink(e.target.value)}
                                required
                            />
                        </div>
                    </>
                )}

                <button type="submit" className="btn btn-primary">
                    Registrarse
                </button>
            </form>
        </div>
    );
};