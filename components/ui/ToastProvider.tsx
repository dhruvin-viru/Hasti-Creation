'use client';

import { Toaster } from 'react-hot-toast';

export const ToastProvider = () => {
  return (
    <Toaster 
      position="bottom-right"
      toastOptions={{
        duration: 3500,
        style: {
          background: '#0f172a',
          color: '#ffffff',
          fontSize: '13px',
          fontWeight: 500,
          borderRadius: '12px',
          padding: '12px 16px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
        },
        success: {
          iconTheme: {
            primary: '#10b981',
            secondary: '#ffffff',
          },
        },
        error: {
          iconTheme: {
            primary: '#ef4444',
            secondary: '#ffffff',
          },
        },
      }}
    />
  );
};
