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
import MobileLayout from "@/components/MobileLayout";

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
              <Route path="/login" element={<MobileLayout><Login /></MobileLayout>} />
              <Route path="/signup" element={<MobileLayout><Signup /></MobileLayout>} />
              <Route path="/reset-password" element={<MobileLayout><ResetPassword /></MobileLayout>} />

              {/* Protected user routes */}
              <Route path="/" element={<MobileLayout><ProtectedRoute><Feed /></ProtectedRoute></MobileLayout>} />
              <Route path="/event/:id" element={<MobileLayout><ProtectedRoute><EventDetail /></ProtectedRoute></MobileLayout>} />
              <Route path="/tickets" element={<MobileLayout><ProtectedRoute><Tickets /></ProtectedRoute></MobileLayout>} />
              <Route path="/search" element={<MobileLayout><ProtectedRoute><SearchPage /></ProtectedRoute></MobileLayout>} />
              <Route path="/chat" element={<MobileLayout><ProtectedRoute><Chat /></ProtectedRoute></MobileLayout>} />
              <Route path="/chat/:id" element={<MobileLayout><ProtectedRoute><ChatConversation /></ProtectedRoute></MobileLayout>} />
              <Route path="/profile" element={<MobileLayout><ProtectedRoute><Profile /></ProtectedRoute></MobileLayout>} />
              <Route path="/create-event" element={<MobileLayout><ProtectedRoute><CreateEvent /></ProtectedRoute></MobileLayout>} />
              <Route path="/admin-scan" element={<MobileLayout><ProtectedRoute><AdminScan /></ProtectedRoute></MobileLayout>} />
              <Route path="/map" element={<MobileLayout><ProtectedRoute><PartyMap /></ProtectedRoute></MobileLayout>} />
              <Route path="/radar" element={<MobileLayout><ProtectedRoute><NightlifeRadar /></ProtectedRoute></MobileLayout>} />
              <Route path="/organizer" element={<MobileLayout><ProtectedRoute><OrganizerDashboard /></ProtectedRoute></MobileLayout>} />
              <Route path="/organizer/event/:id" element={<MobileLayout><ProtectedRoute><OrganizerEventDetail /></ProtectedRoute></MobileLayout>} />
              <Route path="/settings" element={<MobileLayout><ProtectedRoute><Settings /></ProtectedRoute></MobileLayout>} />

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
