import { NavLink } from 'react-router-dom';
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from '@clerk/clerk-react';

export function AppHeader() {
  return (
    <header className="app-header">
      <NavLink to="/" className="site-title">
        Global News
      </NavLink>
      <nav>
        <ul>
          <li>
            <NavLink
              to="/"
              className={({ isActive }) => (isActive ? 'active-link' : '')}
            >
              Home
            </NavLink>
          </li>
          <li>
            <header className="header">
              <SignedOut>
                <SignInButton />
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
            </header>
          </li>
        </ul>
      </nav>
    </header>
  );
}
