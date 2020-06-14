import { init } from './js/app.js'

import './styles/style.scss'

window.addEventListener('DOMContentLoaded', init);

// If in Production mode, check that service workers are supported
if (PRODUCTION) {
   console.log('Production mode!');
   if ('serviceWorker' in navigator) {
      // Use the window load event to register service worker
      window.addEventListener('load', () => {
         navigator.serviceWorker.register('/service-worker.js')
         .then(registration => {
            console.log('SW registered: ', registration);
         }).catch(registrationError => {
            console.log('SW registration failed: ', registrationError);
         });
      });
   }
} else {
  console.log('Development mode...'); 
}
