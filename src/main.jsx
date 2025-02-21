import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './assets/main.css';
import App from './App.jsx';
import { ClerkProvider } from '@clerk/clerk-react';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Render appen med eller uten Clerk basert på om nøkkelen er tilgjengelig
const root = createRoot(document.getElementById('root'));

if (PUBLISHABLE_KEY) {
  root.render(
    <StrictMode>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <App />
      </ClerkProvider>
    </StrictMode>
  );
} else {
  console.warn('Clerk publishable key not found, running without authentication');
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
