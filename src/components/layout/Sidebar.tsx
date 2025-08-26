
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Sidebar as SidebarComponent,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { Home, BarChart, Settings, Users, Calendar, PieChart, Trophy } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { LogoWhiteBg } from "@/assets/logo-white-bg";

const Sidebar = () => {
  const { isAdmin, isMensalista, currentUser } = useUser();
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <SidebarComponent>
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LogoWhiteBg className="h-6 w-6" />
          <h2 className="font-bold text-lg">Pelada Sagaz</h2>
        </div>
        <SidebarTrigger className="md:hidden p-2" />
      </div>
      
      <SidebarContent>
        <SidebarMenu>
          {/* Página inicial - todos os usuários podem ver (admin, mensalista, viewer) */}
          <SidebarMenuItem>
            <SidebarMenuButton asChild className={cn(
              "flex items-center gap-3 px-4 py-2 rounded-full",
              isActive('/') && "bg-gray-800 text-white"
            )}>
              <Link to="/">
                <Home className="h-5 w-5" />
                <span>Início</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          {/* Artilharia - todos os usuários podem ver (admin, mensalista, viewer) */}
          <SidebarMenuItem>
            <SidebarMenuButton asChild className={cn(
              "flex items-center gap-3 px-4 py-2 rounded-full",
              isActive('/artilharia') && "bg-gray-800 text-white"
            )}>
              <Link to="/artilharia">
                <BarChart className="h-5 w-5" />
                <span>Artilharia</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          {/* Financeiro - apenas mensalista e admin */}
          {(isMensalista || isAdmin) && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild className={cn(
                "flex items-center gap-3 px-4 py-2 rounded-full",
                isActive('/financeiro') && "bg-gray-800 text-white"
              )}>
                <Link to="/financeiro">
                  <PieChart className="h-5 w-5" />
                  <span>Financeiro</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          
          {/* Funcionalidades exclusivas para admin */}
          {isAdmin && (
            <>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className={cn(
                  "flex items-center gap-3 px-4 py-2 rounded-full",
                  isActive('/jogadores') && "bg-gray-800 text-white"
                )}>
                  <Link to="/jogadores">
                    <Users className="h-5 w-5" />
                    <span>Jogadores</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild className={cn(
                  "flex items-center gap-3 px-4 py-2 rounded-full",
                  isActive('/jogos') && "bg-gray-800 text-white"
                )}>
                  <Link to="/jogos">
                    <Calendar className="h-5 w-5" />
                    <span>Jogos</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild className={cn(
                  "flex items-center gap-3 px-4 py-2 rounded-full",
                  isActive('/campeonatos') && "bg-gray-800 text-white"
                )}>
                  <Link to="/campeonatos">
                    <Trophy className="h-5 w-5" />
                    <span>Campeonatos</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild className={cn(
                  "flex items-center gap-3 px-4 py-2 rounded-full",
                  isActive('/admin') && "bg-gray-800 text-white"
                )}>
                  <Link to="/admin">
                    <Settings className="h-5 w-5" />
                    <span>Administração</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </>
          )}
        </SidebarMenu>
      </SidebarContent>
    </SidebarComponent>
  );
};

export default Sidebar;
