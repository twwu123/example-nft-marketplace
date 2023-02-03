import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { NamiProvider } from './hooks/useNami';
import { ToastProvider } from './common/toast/ToastContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <NamiProvider>
    <ToastProvider>
      <React.StrictMode>
        <App />
      </React.StrictMode>
    </ToastProvider>
  </NamiProvider>
);