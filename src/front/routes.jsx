import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";

import { Layout } from "./pages/Layout";

// Public pages
import { Home } from "./pages/Home";
import { VolunteerList } from "./pages/OrganizerProfile";
import { VolunteerDetails } from "./pages/VolunteerDetails";

// Pages you are responsible for
import { CreateEvent } from "./pages/CreateEvent";
import { VolunteerProfile } from "./pages/VolunteerProfile";
import { OrganizerProfile } from "./pages/OrganizerProfile";
import { Donations } from "./pages/Donations";

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />} errorElement={<h1>Not found!</h1>}>

      <Route index element={<Home />} />

      {/* Events */}
      <Route path="events" element={<VolunteerList />} />
      <Route path="events/new" element={<CreateEvent />} />
      <Route path="events/:id" element={<VolunteerDetails />} />

      {/* Profiles */}
      <Route path="profile/volunteer" element={<VolunteerProfile />} />
      <Route path="profile/organizer" element={<OrganizerProfile />} />

      {/* Donations */}
      <Route path="donations" element={<Donations />} />

    </Route>
  )
);
