import { useParams } from "react-router-dom";

export const VolunteerDetails = () => {
  const { id } = useParams();

  return (
    <div>
      <h1>Volunteer Opportunity Details</h1>
      <p>Opportunity ID: {id}</p>
    </div>
  );
};
