import { Link } from "react-router-dom";

export const FormNewEvent = ({ information, eliminar }) => {
  const getImageUrl = () => {
    if (!information.image) {
      return "https://via.placeholder.com/300x200?text=No+Image";
    }

    // Ya es Cloudinary (URL completa)
    if (information.image.startsWith("http")) {
      return information.image.replace(
        "/upload/",
        "/upload/f_auto,q_auto,w_300,h_200,c_fill/"
      );
    }

    // Legacy filename (por si quedó alguno en BD)
    return "https://via.placeholder.com/300x200?text=No+Image";
  };

  const imageUrl = getImageUrl();

  console.log("EVENT IMAGE =>", information.image);

  return (
    <div className="card container mb-3" style={{ maxWidth: "640px" }}>
      <div className="row g-0">
        <div className="col-md-4">
          <img
            src={imageUrl}
            className="img-fluid rounded-start h-100 object-fit-cover"
            alt={information.name}
          />
        </div>

        <div className="col-md-8">
          <div className="card-body">
            <h5 className="card-title d-flex justify-content-between">
              {information.name}
              <div>
                <Link to={`/editevent/${information.eventID}`}>
                  <button className="btn btn-outline-secondary border-0">
                    <i className="fa-solid fa-pencil"></i>
                  </button>
                </Link>
                <button
                  className="btn btn-outline-secondary border-0"
                  onClick={() => eliminar(information.eventID)}
                >
                  <i className="fa-solid fa-trash"></i>
                </button>
              </div>
            </h5>

            <p><i className="fa-solid fa-calendar me-2"></i>{information.event_date}</p>
            <p><i className="fa-solid fa-location-dot me-2"></i>{information.location}</p>
            <p><i className="fa-solid fa-tag me-2"></i>{information.category}</p>
            <p><i className="fa-solid fa-users me-2"></i>{information.max_volunteers} volunteers</p>
            <p className="mt-2">{information.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};