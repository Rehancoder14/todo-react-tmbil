// main.jsx or index.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import AppWrapper from './App';
import './index.css'; // Make sure this exists

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AppWrapper />
  </React.StrictMode>
);
