
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { UserProvider } from "./contexts/UserContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import RequireRole from "./components/auth/RequireRole";
import Index from "./pages/Index";
import Artilharia from "./pages/Artilharia";
import Financeiro from "./pages/Financeiro";
import Jogadores from "./pages/Jogadores";
import Jogos from "./pages/Jogos";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import CreatePassword from "./pages/CreatePassword";
import Register from "./pages/Register";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

interface RequireAuthProps {
  children: JSX.Element;
}

const RequireAuth = ({ children }: RequireAuthProps) => {
  const { isLoggedIn, isLoading } = useAuth();
  const location = useLocation();

  console.log("RequireAuth state:", { isLoggedIn, isLoading, pathname: location.pathname });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500 mx-auto mb-4" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
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
              <Route path="/register" element={<Register />} />
              
              {/* Protected routes - Todos os usuários autenticados (admin, mensalista, viewer) */}
              <Route path="/" element={
                <RequireAuth>
                  <RequireRole allowedRoles={['admin', 'mensalista', 'viewer']}>
                    <Index />
                  </RequireRole>
                </RequireAuth>
              } />
              <Route path="/artilharia" element={
                <RequireAuth>
                  <RequireRole allowedRoles={['admin', 'mensalista', 'viewer']}>
                    <Artilharia />
                  </RequireRole>
                </RequireAuth>
              } />
              
              {/* Protected routes - Mensalista e Admin apenas */}
              <Route path="/financeiro" element={
                <RequireAuth>
                  <RequireRole allowedRoles={['admin', 'mensalista']}>
                    <Financeiro />
                  </RequireRole>
                </RequireAuth>
              } />
              
              {/* Protected routes - Admin apenas */}
              <Route path="/jogadores" element={
                <RequireAuth>
                  <RequireRole allowedRoles={['admin']}>
                    <Jogadores />
                  </RequireRole>
                </RequireAuth>
              } />
              <Route path="/jogos" element={
                <RequireAuth>
                  <RequireRole allowedRoles={['admin']}>
                    <Jogos />
                  </RequireRole>
                </RequireAuth>
              } />
              <Route path="/admin" element={
                <RequireAuth>
                  <RequireRole allowedRoles={['admin']}>
                    <Admin />
                  </RequireRole>
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
