import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";

import { Layout } from "./pages/Layout";

// Existing pages
import { Home } from "./pages/Home";
import { Demo } from "./pages/Demo";
import { Single } from "./pages/Single";

import { Signup } from "./pages/Signup";
import { Login } from "./pages/Login";
import { CreateEvent } from "./pages/CreateEvent";
import { VolunteerProfile } from "./pages/VolunteerProfile";
import { OrganizerProfile } from "./pages/OrganizerProfile";
import { Donations } from "./pages/Donations";
import { Success } from "./pages/Success";
import { Cancel } from "./pages/Cancel";

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />} errorElement={<h1>Not found!</h1>}>
      <Route index element={<Home />} />

      {/* Auth */}
      <Route path="register" element={<Signup />} />
      <Route path="login" element={<Login />} />

      {/* Events */}
      <Route path="events" element={<Demo />} />
      <Route path="events/new" element={<CreateEvent />} />
      <Route path="events/:id" element={<Single />} />

      {/* Profiles */}
      <Route path="profile/volunteer" element={<VolunteerProfile />} />
      <Route path="profile/organizer" element={<OrganizerProfile />} />

      {/* Donations */}
      <Route path="donations" element={<Donations />} />
      <Route path="success" element={<Success />} />
      <Route path="cancel" element={<Cancel />} />
    </Route>
  )
);
