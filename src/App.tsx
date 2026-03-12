import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import BottomNav from "@/components/BottomNav";
import NotificationCenter from "@/components/NotificationCenter";

// User pages
import Feed from "./pages/Feed";
import EventDetail from "./pages/EventDetail";
import Tickets from "./pages/Tickets";
import SearchPage from "./pages/SearchPage";
import Chat from "./pages/Chat";
import ChatConversation from "./pages/ChatConversation";
import Profile from "./pages/Profile";
import CreateEvent from "./pages/CreateEvent";
import AdminScan from "./pages/AdminScan";
import PartyMap from "./pages/PartyMap";
import NightlifeRadar from "./pages/NightlifeRadar";
import OrganizerDashboard from "./pages/OrganizerDashboard";
import OrganizerEventDetail from "./pages/OrganizerEventDetail";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import Settings from "./pages/Settings";

// Admin pages
import AdminEventsPage from "./pages/admin/EventsPage";
import AdminCitiesPage from "./pages/admin/CitiesPage";
import AdminCityDetailPage from "./pages/admin/CityDetailPage";
import AdminSourcesPage from "./pages/admin/SourcesPage";
import AdminOrganizersPage from "./pages/admin/OrganizersPage";
import AdminOrganizerDetailPage from "./pages/admin/OrganizerDetailPage";
import AdminExtractPage from "./pages/admin/ExtractPage";
import AdminOutreachPage from "./pages/admin/OutreachPage";
import AdminPreviewPage from "./pages/admin/PreviewPage";
import AdminEventDetailPage from "./pages/admin/EventDetailPageAdmin";
import AdminVenueDetailPage from "./pages/admin/VenueDetailPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <NotificationProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Protected user routes */}
              <Route path="/" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
              <Route path="/event/:id" element={<ProtectedRoute><EventDetail /></ProtectedRoute>} />
              <Route path="/tickets" element={<ProtectedRoute><Tickets /></ProtectedRoute>} />
              <Route path="/search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
              <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
              <Route path="/chat/:id" element={<ProtectedRoute><ChatConversation /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/create-event" element={<ProtectedRoute><CreateEvent /></ProtectedRoute>} />
              <Route path="/admin-scan" element={<ProtectedRoute><AdminScan /></ProtectedRoute>} />
              <Route path="/map" element={<ProtectedRoute><PartyMap /></ProtectedRoute>} />
              <Route path="/radar" element={<ProtectedRoute><NightlifeRadar /></ProtectedRoute>} />
              <Route path="/organizer" element={<ProtectedRoute><OrganizerDashboard /></ProtectedRoute>} />
              <Route path="/organizer/event/:id" element={<ProtectedRoute><OrganizerEventDetail /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

              {/* Admin routes */}
              <Route path="/admin" element={<AdminEventsPage />} />
              <Route path="/admin/cities" element={<AdminCitiesPage />} />
              <Route path="/admin/cities/:name" element={<AdminCityDetailPage />} />
              <Route path="/admin/sources" element={<AdminSourcesPage />} />
              <Route path="/admin/organizers" element={<AdminOrganizersPage />} />
              <Route path="/admin/organizers/:id" element={<AdminOrganizerDetailPage />} />
              <Route path="/admin/extract" element={<AdminExtractPage />} />
              <Route path="/admin/outreach" element={<AdminOutreachPage />} />
              <Route path="/admin/preview" element={<AdminPreviewPage />} />
              <Route path="/admin/events/:id" element={<AdminEventDetailPage />} />
              <Route path="/admin/venues/:name" element={<AdminVenueDetailPage />} />

              <Route path="*" element={<NotFound />} />
            </Routes>
            <NotificationCenter />
            <BottomNav />
          </BrowserRouter>
        </NotificationProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
