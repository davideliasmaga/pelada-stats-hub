
import React from "react";
import { useUser } from "@/contexts/UserContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { UserRole } from "@/types";
import { LogoWhiteBg } from "@/assets/logo-white-bg";

const TopBar = () => {
  const { currentUser, setCurrentUser } = useUser();
  
  const handleRoleChange = (role: UserRole) => {
    if (currentUser) {
      setCurrentUser({ ...currentUser, role });
    }
  };
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };
  
  return (
    <header className="border-b bg-white p-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden mr-2" />
        <LogoWhiteBg className="h-8 w-8" />
        <h1 className="text-xl font-bold">Pelada Sagaz</h1>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Role switcher for demo purposes */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="rounded-full">
              {currentUser?.role === 'admin' 
                ? 'Admin' 
                : currentUser?.role === 'mensalista' 
                  ? 'Mensalista' 
                  : 'Viewer'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Trocar Função</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleRoleChange('admin')}>
              Admin
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleRoleChange('mensalista')}>
              Mensalista
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleRoleChange('viewer')}>
              Viewer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="cursor-pointer">
              {currentUser?.avatar ? (
                <AvatarImage src={currentUser.avatar} />
              ) : null}
              <AvatarFallback>
                {currentUser?.name ? getInitials(currentUser.name) : 'U'}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Perfil</DropdownMenuItem>
            <DropdownMenuItem>Configurações</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Sair</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default TopBar;
