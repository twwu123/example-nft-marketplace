import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { YoroiProvider } from './hooks/useYoroi';
import { ToastProvider } from './common/toast/ToastContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <YoroiProvider>
    <ToastProvider>
      <React.StrictMode>
        <App />
      </React.StrictMode>
    </ToastProvider>
  </YoroiProvider>
);