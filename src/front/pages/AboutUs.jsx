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
          <h1 className="card-title text-center">
            Why Helping Souls Was Created
          </h1>

          <h3 className="card-title mt-4">OUR MISSION</h3>

          <p className="card-text">
            From taking part in fundraisers to support people affected by wildfires
            and other natural disasters, to cleaning coastlines or national parks of
            waste that can take thousands of years to decompose and harm wildlife,
            our goal is to create a meeting place for diverse volunteer campaigns
            around the world.
          </p>

          <p className="card-text">
            We believe that helping others is not limited to supporting people in
            need, such as working in a soup kitchen. It also means caring for animals,
            protecting nature, and restoring ecosystems — from animal shelters to
            reforestation projects. We want you to be able to find all of that, and
            more, in one place.
          </p>

          <h3 className="card-title mt-4">OUR VISION</h3>

          <p className="card-text">
            To connect with one another, with our communities, and with the
            environment, believing that small, selfless acts can create a powerful
            impact.
          </p>

          <p className="card-text">
            We hope that in the future, everyone can say they have volunteered for a
            good cause at least once in their lives. Helping others enriches your
            life: it brings hope in a world often marked by desolation and
            selfishness, helps you discover yourself better, and allows us to believe
            in a more supportive, empathetic, and sustainable future.
          </p>
        </div>
      </div>
    </>
  );
};