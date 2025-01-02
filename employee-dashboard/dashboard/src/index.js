import React from 'react';
import ReactDOM from 'react-dom/client'; // Update to use the new ReactDOM API
import { BrowserRouter as Router } from 'react-router-dom';
import './index.css'; // No change needed here

import App from './App';
import reportWebVitals from './reportWebVitals';

// Create a root for React 18
const root = ReactDOM.createRoot(document.getElementById('root'));

// Use the new render method
root.render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>
);

// Optional: Performance measurement
reportWebVitals();
