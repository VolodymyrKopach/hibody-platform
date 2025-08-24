'use client';

import React from 'react';
import Layout from '@/components/layout/Layout';
import TemplateGenerationPage from '@/components/templates/TemplateGenerationPage';

const CreateLessonPage: React.FC = () => {
  return (
    <Layout>
      <TemplateGenerationPage />
    </Layout>
  );
};

export default CreateLessonPage;
