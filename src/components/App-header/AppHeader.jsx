import { NavLink } from 'react-router-dom';

export function AppHeader() {
  return (
    <header className="app-header">
      <NavLink to="/">
        <img className="logo" src="/logo.png" alt="logo" />
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
        </ul>
      </nav>
    </header>
  );
}
