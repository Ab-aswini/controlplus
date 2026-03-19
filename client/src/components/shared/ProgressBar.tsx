import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import nprogress from 'nprogress';
import 'nprogress/nprogress.css';

// Customize nprogress
nprogress.configure({ 
  showSpinner: false, 
  trickleSpeed: 200, 
  minimum: 0.1 
});

export default function ProgressBar() {
  const location = useLocation();

  useEffect(() => {
    nprogress.start();
    
    // Simulate short delay to allow bar to show during fast transitions
    const timer = setTimeout(() => {
      nprogress.done();
    }, 300);

    return () => {
      clearTimeout(timer);
      nprogress.done();
    };
  }, [location.pathname]);

  return null;
}
