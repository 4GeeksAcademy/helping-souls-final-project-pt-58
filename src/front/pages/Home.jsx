import React, { useEffect } from "react"
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

export const Home = () => {

	const { store, dispatch } = useGlobalReducer()

	const loadMessage = async () => {
		try {
			const backendUrl = import.meta.env.VITE_BACKEND_URL

			if (!backendUrl) {
      		console.error("VITE_BACKEND_URL is not defined");
      		return;
   			 }

			const response = await fetch(backendUrl + "/api/hello")
			const data = await response.json()

			if (response.ok) dispatch({ type: "set_hello", payload: data.message })

			return data

		} catch (error) {
			if (error.message) throw new Error(
				`Could not fetch the message from the backend.
				Please check if the backend is running and the backend port is public.`
			);
		}

	};

	useEffect(() => {
		loadMessage()
	}, [])

return (
  <>
    <div className="card text">
      <img
        src="https://quiurevista.com/wp-content/uploads/2021/09/Voluntariado_Beneficios.jpg"
        className="img-fluid mb-3"
        alt="Helping Souls"
      />
      <div className="card-img-overlay">
        <h1 className="card-title">Helping Souls</h1>
        <p className="card-text">
          Helping the world and others is helping yourself
        </p>
        <p className="card-text">
          <small>Let's be volunteers</small>
        </p>
      </div>
    </div>
    <div className="alert alert-info mt-3">
      {store.message ? (
        <span>{store.message}</span>
      ) : (
        <span className="text-danger">
          Loading message from the backend (make sure your python 🐍 backend is running)...
        </span>
      )}
    </div>
  </>
);
};