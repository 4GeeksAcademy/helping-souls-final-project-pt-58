import React from "react";

export function GoogleMapEmbed({ location, height = 280 }) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (!location) return null;

  // Option A: no key
  const fallbackSrc = `https://www.google.com/maps?q=${encodeURIComponent(location)}&output=embed`;

  // Option B: with key (preferred)
  const src = apiKey
    ? `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodeURIComponent(location)}`
    : fallbackSrc;

  return (
    <div
      style={{
        width: "100%",
        borderRadius: "18px",
        overflow: "hidden",
        boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
        background: "#fff",
      }}
    >
      <iframe
        title="Google Map"
        width="100%"
        height={height}
        style={{ border: 0, display: "block" }}
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        src={src}
      />
    </div>
  );
}
