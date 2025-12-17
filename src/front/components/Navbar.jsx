import { Link } from "react-router-dom";
import React from "react";


export const Navbar = () => {
  const handleContact = () => {
    alert("Contact form");
  };
  const handleAboutUs = () => {
    alert("Project description");
  };

  const handleDonations
    = () => {
      alert("Donations");
    };

  const handleCategory = (category) => {
    alert(`campaign types: ${category}`);
  };

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
          data-bs-target="/navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">


            <li className="nav-item">
              <button
                className="nav-link btn btn-Link active"
                onClick={handleContact}
              >
                Contacto
              </button>
            </li>
            <li className="nav-item">
              <button
                className="nav-link btn btn-Link active"
                onClick={handleAboutUs}
              >
                About Us
              </button>
            </li>
            <li className="nav-item">
              <button
                className="nav-link btn btn-Link active"
                onClick={handleDonations}
              >
                Donations
              </button>
            </li>
            <li className="nav-item dropdown">
              <Link
                className="nav-link active  dropdown-toggle"
                href="/"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Category
              </Link>

              <ul className="dropdown-menu">
                <li>
                  <button
                    className="dropdown-item"
                    onClick={() => handleCategory("Animals")}
                  >
                    Animals
                  </button>
                </li>
                <li>
                  <button
                    className="dropdown-item"
                    onClick={() => handleCategory("Environment")}
                  >
                    Environment
                  </button>
                </li>
                <li>
                  <button
                    className="dropdown-item"
                    onClick={() => handleCategory("Seniors")}
                  >
                    Seniors
                  </button>
                </li>
                <li>
                  <button
                    className="dropdown-item"
                    onClick={() => handleCategory("Children")}
                  >
                    Children
                  </button>
                </li>
                <li>
                  <button
                    className="dropdown-item"
                    onClick={() => handleCategory("Collection")}
                  >
                    Collection
                  </button>
                </li>
              </ul>
            </li>
          </ul>
          <div className="d-flex gap-2 ms-auto">
            <Link to="/login" className="btn btn-outline-primary">
              Login
            </Link>
            <Link to="/signup" className="btn btn-primary">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
