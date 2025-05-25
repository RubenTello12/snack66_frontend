import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import Router from './router';
import { OrderProvider } from './context/OrderContext';
import { SettingsProvider } from './context/SettingsContext';


createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <SettingsProvider>
        <OrderProvider>
          <Router />
        </OrderProvider>
      </SettingsProvider>
  </StrictMode>
);
