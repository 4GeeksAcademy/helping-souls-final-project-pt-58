import React, { useEffect, useMemo, useState } from "react";

function getTimeLeft(targetDate) {
  const now = new Date();
  const diff = targetDate.getTime() - now.getTime();

  if (Number.isNaN(targetDate.getTime())) return null;

  if (diff <= 0) return { done: true, days: 0, hours: 0, minutes: 0, seconds: 0 };

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { done: false, days, hours, minutes, seconds };
}

export default function EventCountdown({ eventDateISO }) {
  const target = useMemo(() => {
    if (!eventDateISO) return null;
    // evento "all-day": lo ponemos a las 09:00 local para evitar líos de zona horaria
    const d = new Date(`${String(eventDateISO).slice(0, 10)}T09:00:00`);
    return Number.isNaN(d.getTime()) ? null : d;
  }, [eventDateISO]);

  const [left, setLeft] = useState(() => (target ? getTimeLeft(target) : null));

  useEffect(() => {
    if (!target) return;
    const id = setInterval(() => setLeft(getTimeLeft(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  if (!target || !left) return null;

  return (
    <div className="alert alert-info">
      {left.done ? (
        <strong>El evento ya empezó (o ya pasó).</strong>
      ) : (
        <strong>
          Faltan: {left.days}d {left.hours}h {left.minutes}m {left.seconds}s
        </strong>
      )}
    </div>
  );
}
