
import React from 'react';

interface LogoProps {
  className?: string;
}

export const LogoBlackBg: React.FC<LogoProps> = ({ className = "h-12 w-12" }) => {
  return (
    <img 
      src="/lovable-uploads/371657d0-4c0d-440c-af94-135d65164cd1.png" 
      alt="Pelada Sagaz Logo" 
      className={className} 
    />
  );
};
