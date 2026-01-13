import React from "react";
import { useSearchParams } from "react-router-dom";

const CATEGORIES = ["animals", "environment", "seniors", "children", "collection"];

export const EventFilters = () => {
  const [params, setParams] = useSearchParams();

  const category = params.get("category") || "";
  const city = params.get("city") || "";          // 👈 CAMBIO
  const from = params.get("from") || "";
  const to = params.get("to") || "";

  const update = (patch) => {
    const next = new URLSearchParams(params);

    Object.entries(patch).forEach(([key, value]) => {
      if (!value) next.delete(key);
      else next.set(key, value);
    });

    setParams(next);
  };

  const clearAll = () => setParams(new URLSearchParams());

  return (
    <div className="card p-3 mb-3">
      <div className="row g-2 align-items-end">

        {/* Category */}
        <div className="col-12 col-md-3">
          <label className="form-label">Category</label>
          <select
            className="form-select"
            value={category}
            onChange={(e) => update({ category: e.target.value })}
          >
            <option value="">All</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* City */}
        <div className="col-12 col-md-3">
          <label className="form-label">City</label>
          <input
            className="form-control"
            value={city}
            placeholder="Search by city"
            onChange={(e) => update({ city: e.target.value })}  
          />
        </div>

        {/* From */}
        <div className="col-6 col-md-2">
          <label className="form-label">From</label>
          <input
            type="date"
            className="form-control"
            value={from}
            onChange={(e) => update({ from: e.target.value })}
          />
        </div>

        {/* To */}
        <div className="col-6 col-md-2">
          <label className="form-label">To</label>
          <input
            type="date"
            className="form-control"
            value={to}
            onChange={(e) => update({ to: e.target.value })}
          />
        </div>

        {/* Clear */}
        <div className="col-12 col-md-2 d-flex gap-2">
          <button className="btn btn-outline-secondary w-100" onClick={clearAll}>
            Clear
          </button>
        </div>

      </div>
    </div>
  );
};
