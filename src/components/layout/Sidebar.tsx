
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
import { Home, BarChart, Settings, Users, Calendar, PieChart, Ball } from "lucide-react";
import { useUser } from "@/contexts/UserContext";

const Sidebar = () => {
  const { isAdmin, isMensalista } = useUser();
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <SidebarComponent>
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Ball className="h-6 w-6 text-grass" />
          <h2 className="font-bold text-lg">Pelada Stats</h2>
        </div>
        <SidebarTrigger className="md:hidden p-2" />
      </div>
      
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className={cn(
              "flex items-center gap-3 px-4 py-2 rounded-full",
              isActive('/') && "bg-primary text-primary-foreground"
            )}>
              <Link to="/">
                <Home className="h-5 w-5" />
                <span>Início</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton asChild className={cn(
              "flex items-center gap-3 px-4 py-2 rounded-full",
              isActive('/artilharia') && "bg-primary text-primary-foreground"
            )}>
              <Link to="/artilharia">
                <BarChart className="h-5 w-5" />
                <span>Artilharia</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          {isMensalista && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild className={cn(
                "flex items-center gap-3 px-4 py-2 rounded-full",
                isActive('/financeiro') && "bg-primary text-primary-foreground"
              )}>
                <Link to="/financeiro">
                  <PieChart className="h-5 w-5" />
                  <span>Financeiro</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          
          {isAdmin && (
            <>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className={cn(
                  "flex items-center gap-3 px-4 py-2 rounded-full",
                  isActive('/jogadores') && "bg-primary text-primary-foreground"
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
                  isActive('/jogos') && "bg-primary text-primary-foreground"
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
                  isActive('/admin') && "bg-primary text-primary-foreground"
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
