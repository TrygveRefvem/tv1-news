import { Outlet } from 'react-router';
import { AppHeader } from './App-header/AppHeader.jsx';
import { Footer } from './Footer/Footer.jsx';

export function RootLayout() {
  return (
    <div className="main-layout">
      <AppHeader />

      <Outlet />
      <Footer />
    </div>
  );
}
