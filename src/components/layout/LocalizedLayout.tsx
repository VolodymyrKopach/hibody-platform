'use client';

import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface LocalizedLayoutProps {
  children: React.ReactNode;
}

export const LocalizedLayout: React.FC<LocalizedLayoutProps> = ({ children }) => {
  const { i18n } = useTranslation();

  useEffect(() => {
    // Update document language attribute when language changes
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return <>{children}</>;
};

export default LocalizedLayout; 