import React from 'react';
import { useLocation } from 'react-router-dom';

export const Analytics: React.FC = () => {
  const location = useLocation();

  React.useEffect(() => {
    // This would typically integrate with a real analytics service
    console.log(`Page viewed: ${location.pathname}`);
  }, [location]);

  return null; // This component doesn't render anything
};