import React from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css';
import overviewImg from '../images/overview.png';
import perfTechLogo from '../images/PerfTechLogo03.png';
import location from '../images/download-removebg-preview.png';

const Sidebar = ({ role, onLogout }) => {
  // Define dynamic top style for role 4 (Project Manager)
  const projectTabStyle = role === 4 ? { top: '2%' } : { top: '13.5%' };

  return (
    <div className="Sidebar">
      <img className="logo" src={perfTechLogo} alt="Not Found" />
      <nav>
        {role === 2 && ( // Admin sees both Overview and Project
          <>
            <div className="logo1">
              <img className="overview-logo" src={overviewImg} alt="Not Found" />
              <Link to="/">Overview</Link>
            </div>
            <div className="logo2" style={{ top: '13.5%' }}>
              <img className="location-logo" src={location} alt="Not Found" />
              <Link to="/Project">Project Overview</Link>
            </div>
          </>
        )}

        {role === 4 && ( // Project Manager only sees Project
          <div className="logo2" style={projectTabStyle}>
            <img className="location-logo" src={location} alt="Not Found" />
            <Link to="/Project">Project Overview</Link>
          </div>
        )}

        {role === 5 && ( // Employee only sees Overview
          <div className="logo1">
            <img className="overview-logo" src={overviewImg} alt="Not Found" />
            <Link to="/">Overview</Link>
          </div>
        )}

        {/* Logout Button */}
        <div className="logout-section">
          <button className="logout-button" onClick={onLogout}>Logout</button>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
