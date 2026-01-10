import { Link } from "react-router-dom";

export const FormNewEvent = ({ information, eliminar }) => {
  const getImageUrl = () => {
    if (!information.image) {
      return "https://via.placeholder.com/1200x500?text=No+Image";
    }

    if (information.image.startsWith("http")) {
      return information.image.replace(
        "/upload/",
        "/upload/f_auto,q_auto,w_1400,h_500,c_fill/"
      );
    }

    return "https://via.placeholder.com/1200x500?text=No+Image";
  };

  const imageUrl = getImageUrl();

  return (
    /* FULL WIDTH WRAPPER */
    <section className="w-100 d-flex justify-content-center mt-4">
      {/* CENTERED CARD */}
      <div
        className="card shadow border-0"
        style={{
          width: "100%",
          maxWidth: "1200px"
        }}
      >
        {/* IMAGE */}
        <img
          src={imageUrl}
          className="card-img-top"
          alt={information.name}
          style={{ maxHeight: "420px", objectFit: "cover" }}
        />

        <div className="card-body px-4 px-md-5 py-4">
          {/* HEADER */}
          <div className="d-flex justify-content-between align-items-start mb-3">
            <h2 className="mb-0">{information.name}</h2>

            <div>
              <Link to={`/editevent/${information.eventID}`}>
                <button className="btn btn-outline-secondary me-2">
                  <i className="fa-solid fa-pencil"></i>
                </button>
              </Link>

              <button
                className="btn btn-outline-danger"
                onClick={() => eliminar(information.eventID)}
              >
                <i className="fa-solid fa-trash"></i>
              </button>
            </div>
          </div>

          {/* INFO */}
          <div className="row mb-3">
            <div className="col-md-6 mb-2">
              <i className="fa-solid fa-calendar me-2 text-muted"></i>
              {information.event_date}
            </div>

            <div className="col-md-6 mb-2">
              <i className="fa-solid fa-tag me-2 text-muted"></i>
              {information.category}
            </div>

            <div className="col-md-6 mb-2">
              <i className="fa-solid fa-location-dot me-2 text-muted"></i>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  information.location
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-decoration-none"
              >
                {information.location}
              </a>
            </div>

            <div className="col-md-6 mb-2">
              <i className="fa-solid fa-users me-2 text-muted"></i>
              {information.max_volunteers} volunteers
            </div>
          </div>

          {/* DESCRIPTION */}
          <div className="border-top pt-3">
            <p className="mb-0 fs-5">{information.description}</p>
          </div>
        </div>
      </div>
    </section>
  );
};
