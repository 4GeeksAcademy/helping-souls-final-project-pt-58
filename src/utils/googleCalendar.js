// src/utils/googleCalendar.js
function yyyymmdd(dateStr) {
  return String(dateStr).slice(0, 10).replaceAll("-", "");
}

function addDays(dateStr, days) {
  const d = new Date(`${String(dateStr).slice(0, 10)}T00:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function buildGoogleCalendarUrl({ title, dateISO, description, location }) {
  const start = yyyymmdd(dateISO);
  const end = yyyymmdd(addDays(dateISO, 1)); // all-day end = next day

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title || "Volunteer Event",
    dates: `${start}/${end}`,
    details: description || "",
    location: location || ""
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
