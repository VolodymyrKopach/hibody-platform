'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import Layout from '@/components/layout/Layout';
import TemplateGenerationPage from '@/components/templates/TemplateGenerationPage';

const CreateLessonPage: React.FC = () => {
  const { t } = useTranslation('common');

  return (
    <Layout 
      title={t('pages.createLessonTitle')} 
      breadcrumbs={[
        { label: t('navigation.home'), href: '/' }, 
        { label: t('navigation.createLesson') }
      ]}
    >
      <TemplateGenerationPage />
    </Layout>
  );
};

export default CreateLessonPage;
