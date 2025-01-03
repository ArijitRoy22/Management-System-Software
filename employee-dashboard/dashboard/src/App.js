import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Overview from './components/Overview';
import Sidebar from './components/Sidebar';
import Project from './components/Project';
import Login from './components/Login';
import './App.css';
import axios from 'axios';

function App() {
    const [role, setRole] = useState(null);
    const navigate = useNavigate();

    // Fetch role from localStorage
    useEffect(() => {
        const fetchRole = () => {
            const storedRole = localStorage.getItem('role');
            if (storedRole) {
                setRole(parseInt(storedRole, 10));
            } else {
                setRole(null); // Clear role if not found
            }
        };

        fetchRole();
    }, []);

    // Redirect based on role
    useEffect(() => {
        if (role !== null) {
            if (role === 4) {
                navigate('/Project');
            } else if (role === 5) {
                navigate('/Management-System-Sofware');
            } else if (role === 2) {
                navigate('/Management-System-Sofware');
            }
        }
    }, [role, navigate]);

    const handleLogin = (role) => {
        setRole(role);
    };

    const handleLogout = async () => {
        try {
            const backendUrl = process.env.REACT_APP_BACKEND_URL || 'https://login-backend-ayx4.onrender.com/logout';
            await axios.post(backendUrl, {}, { withCredentials: true });
            localStorage.clear(); // Clear localStorage
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
                {role === 2 && <Route path="/Management-System-Sofware" element={<Overview />} />} {/* Admin */}
                {role === 2 && <Route path="/Project" element={<Project />} />} {/* Admin */}
                {role === 4 && <Route path="/Project" element={<Project />} />} {/* Project Manager */}
                {role === 5 && <Route path="/Management-System-Sofware" element={<Overview />} />} {/* Employee */}
            </Routes>
        </div>
    );
}

export default App;
