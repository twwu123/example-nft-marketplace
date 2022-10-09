import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { YoroiProvider } from './hooks/useYoroi';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <YoroiProvider>
    <React.StrictMode>
        <App />
    </React.StrictMode>
  </YoroiProvider>
);