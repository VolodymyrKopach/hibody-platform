import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import RightSidebarRefactored from '../RightSidebarRefactored';
import { RightSidebarProps } from '@/types/sidebar';

const mockProps: RightSidebarProps = {
  isOpen: true,
  onToggle: jest.fn(),
  selection: null,
  onSelectionChange: jest.fn(),
  onUpdate: jest.fn(),
  onDuplicate: jest.fn(),
  onDelete: jest.fn(),
  onPageBackgroundUpdate: jest.fn(),
  onImageUpload: jest.fn(),
  parameters: undefined,
  onAIEdit: jest.fn(),
  editHistory: [],
  isAIEditing: false,
  editError: null,
  onClearEditError: jest.fn(),
};

describe('RightSidebarRefactored', () => {
  it('renders empty state when nothing is selected', () => {
    render(<RightSidebarRefactored {...mockProps} />);
    expect(screen.getByText('Nothing selected')).toBeInTheDocument();
  });

  it('renders page properties when page is selected', () => {
    const propsWithPageSelection: RightSidebarProps = {
      ...mockProps,
      selection: {
        type: 'page',
        data: {
          id: 'page-1',
          title: 'Test Page',
          x: 0,
          y: 0,
        },
      },
    };
    
    render(<RightSidebarRefactored {...propsWithPageSelection} />);
    expect(screen.getByText('Page Properties')).toBeInTheDocument();
  });

  it('renders element properties when element is selected', () => {
    const propsWithElementSelection: RightSidebarProps = {
      ...mockProps,
      selection: {
        type: 'element',
        pageData: { id: 'page-1' },
        elementData: {
          id: 'element-1',
          type: 'text',
          properties: {},
        },
      },
    };
    
    render(<RightSidebarRefactored {...propsWithElementSelection} />);
    expect(screen.getByText('Element Properties')).toBeInTheDocument();
  });
});

