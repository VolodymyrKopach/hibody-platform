'use client';

import React from 'react';
import Layout from '@/components/layout/Layout';
import TemplateGenerationPage from '@/components/templates/TemplateGenerationPage';
import { LessonCreationProvider } from '@/providers/LessonCreationProvider';

const CreateLessonPage: React.FC = () => {
  return (
    <Layout>
      <LessonCreationProvider>
        <TemplateGenerationPage />
      </LessonCreationProvider>
    </Layout>
  );
};

export default CreateLessonPage;
