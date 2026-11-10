import { NavLink } from 'react-router-dom';

// Links to every page, shown across the top of every page
function Navbar() {
  return (
    <nav className="navbar">
      <NavLink to="/" end className="navbar-title">
        HobbyHub
      </NavLink>
      <NavLink to="/" end>Home</NavLink>
      <NavLink to="/create">Create a Post</NavLink>
    </nav>
  );
}

export default Navbar;
