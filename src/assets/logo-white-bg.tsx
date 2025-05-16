
import React from 'react';

interface LogoProps {
  className?: string;
}

export const LogoWhiteBg: React.FC<LogoProps> = ({ className = "h-12 w-12" }) => {
  return (
    <img 
      src="/lovable-uploads/e980f1c4-4a1a-4a1e-b296-d3bc210520f0.png" 
      alt="Pelada Sagaz Logo (Light)" 
      className={className} 
    />
  );
};
