import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MockDataProvider } from "@/context/MockDataContext";
import Index from "./pages/Index";
import Employees from "./pages/Employees";
import Attendance from "./pages/Attendance";
import Notifications from "./pages/Notifications";
import OnLeave from "./pages/OnLeave";
import Holidays from "./pages/Holidays";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <MockDataProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <DashboardLayout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/employees" element={<Employees />} />
              <Route path="/attendance" element={<Attendance />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/on-leave" element={<OnLeave />} />
              <Route path="/holidays" element={<Holidays />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </DashboardLayout>
        </BrowserRouter>
      </MockDataProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
