import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "@/components/Layout/MainLayout";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import Workflows from "./pages/Workflows";
import Statistics from "./pages/Statistics";
import Errors from "./pages/Errors";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

const App = () => (
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route path="/" element={<MainLayout><Dashboard /></MainLayout>} />
        <Route path="/leads" element={<MainLayout><Leads /></MainLayout>} />
        <Route path="/workflows" element={<MainLayout><Workflows /></MainLayout>} />
        <Route path="/stats" element={<MainLayout><Statistics /></MainLayout>} />
        <Route path="/errors" element={<MainLayout><Errors /></MainLayout>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </QueryClientProvider>
  </BrowserRouter>
);

export default App;
