import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import BackgroundEditor from '../page/background/BackgroundEditor';
import { PageBackground } from '@/types/sidebar';

const mockPageData = {
  id: 'page-1',
  title: 'Test Page',
  background: {
    type: 'solid' as const,
    color: '#FFFFFF',
  },
};

describe('BackgroundEditor', () => {
  it('renders background tabs', () => {
    render(
      <BackgroundEditor
        pageData={mockPageData}
        onPageBackgroundUpdate={jest.fn()}
        onImageUpload={jest.fn()}
      />
    );
    
    expect(screen.getByText('Background')).toBeInTheDocument();
    expect(screen.getByText('Colors')).toBeInTheDocument();
    expect(screen.getByText('Gradients')).toBeInTheDocument();
    expect(screen.getByText('Patterns')).toBeInTheDocument();
    expect(screen.getByText('Templates')).toBeInTheDocument();
  });

  it('renders image upload section', () => {
    render(
      <BackgroundEditor
        pageData={mockPageData}
        onPageBackgroundUpdate={jest.fn()}
        onImageUpload={jest.fn()}
      />
    );
    
    expect(screen.getByText('Custom Image Background')).toBeInTheDocument();
  });
});

