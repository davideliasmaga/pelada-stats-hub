
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { UserProvider } from "./contexts/UserContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Index from "./pages/Index";
import Artilharia from "./pages/Artilharia";
import Financeiro from "./pages/Financeiro";
import Jogadores from "./pages/Jogadores";
import Jogos from "./pages/Jogos";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import CreatePassword from "./pages/CreatePassword";

const queryClient = new QueryClient();

// RequireAuth component to protect routes
interface RequireAuthProps {
  children: JSX.Element;
}

const RequireAuth = ({ children }: RequireAuthProps) => {
  const { isLoggedIn, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    // Don't redirect while still checking auth state
    return null;
  }

  if (!isLoggedIn) {
    // Redirect to login page, but save the current location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <UserProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/create-password" element={<CreatePassword />} />
              
              {/* Protected routes */}
              <Route path="/" element={
                <RequireAuth>
                  <Index />
                </RequireAuth>
              } />
              <Route path="/artilharia" element={
                <RequireAuth>
                  <Artilharia />
                </RequireAuth>
              } />
              <Route path="/financeiro" element={
                <RequireAuth>
                  <Financeiro />
                </RequireAuth>
              } />
              <Route path="/jogadores" element={
                <RequireAuth>
                  <Jogadores />
                </RequireAuth>
              } />
              <Route path="/jogos" element={
                <RequireAuth>
                  <Jogos />
                </RequireAuth>
              } />
              <Route path="/admin" element={
                <RequireAuth>
                  <Admin />
                </RequireAuth>
              } />
              <Route path="*" element={
                <RequireAuth>
                  <NotFound />
                </RequireAuth>
              } />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </UserProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
