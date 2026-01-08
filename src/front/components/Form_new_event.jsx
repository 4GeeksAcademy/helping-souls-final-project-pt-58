import useGlobalReducer from "../hooks/useGlobalReducer";
import { Link, useNavigate } from 'react-router-dom';

export const FormNewEvent = ({ information, eliminar }) => {

  return (

    <div className="card container mb-3" style={{ maxWidth: "640px" }}>
      <div className="event row g-0">
        <div className="col-md-4">
          <img
            src={
              information.image
                ? `/uploads/${information.image}`
                : "https://via.placeholder.com/300x200?text=No+Image"
            }
            className="img-fluid rounded-start h-100 object-fit-cover"
            alt={information.name}
          />
        </div>
        <div className="col-md-8">
          <div className="card-body">
            <h5 className="card-title">{information.name}
              <div className="button-card">
                <Link to={`/editevent/${information.eventID}`}>
                  <button className="btn btn-outline-secondary border border-0"><i className="fa-solid fa-pencil"></i></button>
                </Link>
                <button className="btn btn-outline-secondary border-0" onClick={() => eliminar(information.eventID)}><i className="fa-solid fa-trash"></i></button>
              </div>
            </h5>
            <p className="mb-1">
              <i className="fa-solid fa-calendar me-2"></i>
              {information.event_date}
            </p>
            <p className="mb-1">
              <i className="fa-solid fa-location-dot me-2"></i>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(information.location)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-decoration-none"
              >
                {information.location}
              </a>
            </p>
            <p className="mb-1">
              <i className="fa-solid fa-tag me-2"></i>
              {information.category}
            </p>

            <p className="mb-1">
              <i className="fa-solid fa-users me-2"></i>
              {information.max_volunteers} volunteers
            </p>
            <p className="mt-2">{information.description}</p>
          </div>
        </div>
      </div>
    </div>
  )
}