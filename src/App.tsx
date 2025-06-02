
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UserProvider } from "./contexts/UserContext";
import { AuthProvider } from "./contexts/AuthContext";
import RequireRole from "./components/auth/RequireRole";
import RequireAuth from "./components/auth/RequireAuth";
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

const queryClient = new QueryClient();

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
