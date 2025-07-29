import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { Buffer } from 'buffer';  // 👈 Inject Buffer global
window.Buffer = Buffer;           // 👈 Required for crypto-based modules

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();
