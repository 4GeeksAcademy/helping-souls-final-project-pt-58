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
import { CampaignsBoard } from "./pages/CampaignsBoard";
import { Success } from "./pages/Success";
import { Cancel } from "./pages/Cancel";
import { EventsView } from "./pages/Event";
import { DetailedCampaign } from "./pages/DetailedCampaign";
import { ApplyToCampaign } from "./pages/ApplytoCampaign";
import { MyInterestsView } from "./pages/MyInterestsView";
import { AboutUs } from "./pages/AboutUs";
import { ContactView } from "./pages/Contact";


export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />} errorElement={<h1>Not found!</h1>}>
      <Route index element={<Home />} />

      {/* Auth */}
      <Route path="signup" element={<Signup />} />
      <Route path="login" element={<Login />} />

      {/* Events */}
      <Route path="events/new" element={<CreateEvent />} />
      <Route path="events/:id" element={<Single />} />
      <Route path="campaignsboard" element={<CampaignsBoard/>} />
      <Route path="/events" element={<EventsView />} />
      <Route path="/campaigns/:id" element={<DetailedCampaign />} />
      <Route path="/campaigns/:id/apply" element={<ApplyToCampaign />} />
      <Route path="/my-interests" element={<MyInterestsView />} />


      {/* Profiles */}
      <Route path="profile/volunteer" element={<VolunteerProfile />} />
      <Route path="profile/organizer" element={<OrganizerProfile />} />

      {/* Donations */}
      <Route path="donations" element={<Donations />} />
      <Route path="success" element={<Success />} />
      <Route path="cancel" element={<Cancel />} />

      {/* Others */}
      <Route path="aboutus" element={<AboutUs />} />
      <Route path="contact" element={<ContactView />} />

    </Route>
  )
);
