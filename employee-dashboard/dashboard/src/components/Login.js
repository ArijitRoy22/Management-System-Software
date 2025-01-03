import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import './Login.css';

const Login = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    // Dynamically load Bootstrap and FontAwesome CSS for this component only
    useEffect(() => {
        const bootstrap = document.createElement('link');
        bootstrap.rel = 'stylesheet';
        bootstrap.href = 'https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css';
        document.head.appendChild(bootstrap);

        const fontAwesome = document.createElement('link');
        fontAwesome.rel = 'stylesheet';
        fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
        document.head.appendChild(fontAwesome);

        return () => {
            document.head.removeChild(bootstrap);
            document.head.removeChild(fontAwesome);
        };
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const backendUrl = process.env.REACT_APP_BACKEND_URL || 'https://management-system-sofware.onrender.com';
            const response = await axios.post(backendUrl + '/login', { email, password });
            const { token, role, csrfToken } = response.data;

            // Store in localStorage
            localStorage.setItem('token', token);
            localStorage.setItem('role', role);
            localStorage.setItem('csrfToken', csrfToken);

            onLogin(parseInt(role, 10)); // Update the role in the app state
        } catch (error) {
            setError('Invalid credentials');
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="custom-login-page">
            <Container>
                <Row className="justify-content-center">
                    <Col md={4}>
                        <div className="login-box">
                            <h2>Login</h2>
                            {error && <p style={{ color: 'red' }}>{error}</p>}
                            <Form onSubmit={handleLogin}>
                                <Form.Group controlId="formBasicEmail">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        placeholder="Enter email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </Form.Group>

                                <Form.Group controlId="formBasicPassword">
                                    <Form.Label>Password</Form.Label>
                                    <div style={{ position: 'relative' }}>
                                        <Form.Control
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="Password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                        <span
                                            onClick={togglePasswordVisibility}
                                            style={{
                                                position: 'absolute',
                                                right: '10px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} />
                                        </span>
                                    </div>
                                </Form.Group>

                                <Button variant="primary" type="submit" className="w-100 mt-3">
                                    Login
                                </Button>
                            </Form>
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Login;
