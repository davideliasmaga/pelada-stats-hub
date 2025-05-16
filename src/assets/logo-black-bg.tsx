
import React from 'react';

interface LogoProps {
  className?: string;
}

export const LogoBlackBg: React.FC<LogoProps> = ({ className = "h-12 w-12" }) => {
  return (
    <img 
      src="/lovable-uploads/6cd33761-a71b-4e42-89bf-1c7835b8c4fc.png" 
      alt="Pelada Sagaz Logo (Dark)" 
      className={className} 
    />
  );
};
