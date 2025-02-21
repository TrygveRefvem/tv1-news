import { NavLink } from 'react-router-dom';

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
        </ul>
      </nav>
    </header>
  );
}
