import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Map, User, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      <button className="mobile-menu-btn" onClick={toggleSidebar}>
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar Component */}
      <aside className={`sidebar glass-panel ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-logo text-gradient">TravelSync</h2>
        </div>

        <nav className="sidebar-nav">
          <NavLink 
            to="/dashboard" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} 
            onClick={() => setIsOpen(false)}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>
          
          <NavLink 
            to="/trips" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} 
            onClick={() => setIsOpen(false)}
          >
            <Map size={20} />
            <span>My Trips</span>
          </NavLink>
          
          <NavLink 
            to="/profile" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} 
            onClick={() => setIsOpen(false)}
          >
            <User size={20} />
            <span>Profile</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item logout-btn" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
