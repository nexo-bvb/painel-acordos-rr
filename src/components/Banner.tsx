import React from 'react';

export const Banner: React.FC = () => {
  return (
    <div className="custom-banner">
      <div className="banner-content">
        <img 
          src="/banner.svg" 
          alt="Termos de Cooperação Técnica" 
          className="banner-svg"
        />
      </div>
    </div>
  );
};
