import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Overview from './components/Overview';
import Sidebar from './components/Sidebar';
import Project from './components/Project';
import Login from './components/Login';
import './App.css';
import axios from 'axios';
import Cookies from 'js-cookie'; // Library for handling cookies

function App() {
    const [role, setRole] = useState(null);
    const navigate = useNavigate();

    // Fetch cookies to get role and verify user session
    useEffect(() => {
        const fetchRole = () => {
            const roleCookie = Cookies.get('role');
            if (roleCookie) {
                setRole(parseInt(roleCookie, 10));
            } else {
                setRole(null); // Clear role if not found
            }
        };

        fetchRole();

        // Optional: Poll cookies periodically
        const interval = setInterval(fetchRole, 1000);
        return () => clearInterval(interval); // Clean up interval on unmount
    }, []);

    // Redirect based on role
    useEffect(() => {
        if (role === 4) {
            navigate('/Project');
        } else if (role === 5) {
            navigate('/');
        }
    }, [role, navigate]);

    const handleLogin = (role) => {
        setRole(role);
    };

    const handleLogout = async () => {
        try {
            await axios.post('http://localhost:5002/logout', {}, { withCredentials: true });
            setRole(null);
            navigate('/');
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    if (role === null) {
        return <Login onLogin={handleLogin} />;
    }

    return (
        <div className="App">
            <Sidebar role={role} onLogout={handleLogout} />
            <Routes>
                {role === 2 && <Route path="/" element={<Overview />} />} {/* Admin */}
                {role === 2 && <Route path="/Project" element={<Project />} />} {/* Admin */}
                {role === 4 && <Route path="/Project" element={<Project />} />} {/* Project Manager */}
                {role === 5 && <Route path="/" element={<Overview />} />} {/* Employee */}
            </Routes>
        </div>
    );
}

export default App;
