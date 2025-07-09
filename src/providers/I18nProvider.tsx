'use client';

import React, { Suspense } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/lib/i18n';

interface I18nProviderProps {
  children: React.ReactNode;
}

const I18nFallback: React.FC = () => (
  <div style={{ 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    height: '100vh',
    fontSize: '18px'
  }}>
    Loading translations...
  </div>
);

export const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  return (
    <I18nextProvider i18n={i18n}>
      <Suspense fallback={<I18nFallback />}>
        {children}
      </Suspense>
    </I18nextProvider>
  );
}; 