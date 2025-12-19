import { Link, useNavigate } from "react-router-dom";
import React, { useContext } from "react";
import { StoreContext } from "../hooks/useGlobalReducer";

export const Navbar = () => {
  const { store, dispatch } = useContext(StoreContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    dispatch({ type: "logout" });

    navigate("/login");
  const handleCategory = (category) => {
    alert(`campaign types: ${category}`);
  };

  const handleContact = () => alert("Contact form");
  const handleAboutUs = () => alert("Project description");
  const handleDonations = () => alert("Donations");
  const handleCategory = (category) =>
    alert(`campaign types: ${category}`);

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
            {/* Campaigns (solo logueado) */}
            {store.isAuth && (
              <li className="nav-item">
                <Link className="nav-link" to="/campaignsboard">
                  Campaigns
                </Link>
              </li>
            )}
            <li className="nav-item">
              <button className="nav-link btn btn-link" onClick={handleContact}>
                Contacto
              </button>
            </li>

            <li className="nav-item">
              <button className="nav-link btn btn-link" onClick={handleAboutUs}>
                About Us
              </button>
            </li>

            <li className="nav-item">
              <button className="nav-link btn btn-link" onClick={handleDonations}>
                Donations
              </button>
              <Link to='donations'>  
                <button className="btn">
                  Donations
                </button>
              </Link>
            </li>

            <li className="nav-item dropdown">
              <span
                className="nav-link dropdown-toggle"
                role="button"
                data-bs-toggle="dropdown"
              >
                Category
              </span>

              <ul className="dropdown-menu">
                {["Animals", "Environment", "Seniors", "Children", "Collection"].map(
                  (cat) => (
                    <li key={cat}>
                      <button
                        className="dropdown-item"
                        onClick={() => handleCategory(cat)}
                      >
                        {cat}
                      </button>
                    </li>
                  )
                )}
              </ul>
            </li>
          </ul>

          {/* 🔐 AUTH BUTTONS */}
          <div className="d-flex gap-2 ms-auto">
            {store.isAuth ? (
              <button
                className="btn btn-danger"
                onClick={handleLogout}
              >
                Log out
              </button>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline-primary">
                  Login
                </Link>
                <Link to="/signup" className="btn btn-primary">
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;