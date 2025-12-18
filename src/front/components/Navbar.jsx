import { Link } from "react-router-dom";
import React from "react";

export const Navbar = () => {
  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary">
      <div className="container-fluid">

        <Link className="navbar-brand" to="/">
          HELPING SOULS
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">

            {/* Opportunities */}
            <li className="nav-item">
              <Link className="nav-link" to="/opportunities">
                Opportunities
              </Link>
            </li>

            {/* Create opportunity */}
            <li className="nav-item">
              <Link className="nav-link" to="/opportunities/new">
                Create
              </Link>
            </li>

            {/* Profile */}
            <li className="nav-item">
              <Link className="nav-link" to="/profile">
                Profile
              </Link>
            </li>

            {/* Category dropdown (placeholder) */}
            <li className="nav-item dropdown">
              <span
                className="nav-link dropdown-toggle"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Category
              </span>

              <ul className="dropdown-menu">
                <li><span className="dropdown-item">Animals</span></li>
                <li><span className="dropdown-item">Environment</span></li>
                <li><span className="dropdown-item">Seniors</span></li>
                <li><span className="dropdown-item">Children</span></li>
                <li><span className="dropdown-item">Collection</span></li>
              </ul>
            </li>
          </ul>

          {/* Login (aunque sea placeholder) */}
          <Link className="btn btn-outline-success" to="/login">
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
