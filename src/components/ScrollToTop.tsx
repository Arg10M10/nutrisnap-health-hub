import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Evitar hacer scroll al inicio si vamos al scanner para prevenir saltos visuales
    if (pathname === '/scanner') return;
    
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;