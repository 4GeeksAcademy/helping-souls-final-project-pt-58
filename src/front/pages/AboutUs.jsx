import React, { useEffect } from "react"
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

export const AboutUs = () => {

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
      <div className="card-body">
        <h1 className="card-title text-center">Why was Helping Souls born?</h1>

        <h3 className="card-title">OUR MISSION:</h3>
        <p className="card-text">
          From taking part in a fundraiser to help people affected by wildfires or other natural disasters, to cleaning coastlines or national parks of waste that takes thousands of years to decompose or can harm other species, our goal is to be a meeting place for diverse volunteer campaigns that can take place all around the world. 
          Because helping other souls does not have to be limited to helping other people, such as in a soup kitchen; it can also mean helping in animal shelters or reforesting a new forest. We want you to be able to find all of that and more here.
        </p>
        <h3 className="card-title">OUR VISION:</h3>
        <p className="card-text">
          To connect with one another, with our surroundings, and with the environment, believing that small, selfless acts can create a great impact. 
          We hope that in the future we can all say that we have volunteered for a good cause at least once in our lives. Because helping others makes your life better. You show the world a ray of hope amid so much desolation and selfishness, you get to know yourself better, and we can believe in a more supportive, empathetic, and sustainable future.
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