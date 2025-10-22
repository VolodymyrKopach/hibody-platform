import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SidebarHeader from '../SidebarHeader';

describe('SidebarHeader', () => {
  it('renders title when sidebar is open', () => {
    render(
      <SidebarHeader 
        title="Test Title" 
        isOpen={true} 
        onToggle={jest.fn()} 
      />
    );
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('hides title when sidebar is closed', () => {
    render(
      <SidebarHeader 
        title="Test Title" 
        isOpen={false} 
        onToggle={jest.fn()} 
      />
    );
    expect(screen.queryByText('Test Title')).not.toBeInTheDocument();
  });

  it('calls onToggle when button is clicked', () => {
    const mockToggle = jest.fn();
    render(
      <SidebarHeader 
        title="Test Title" 
        isOpen={true} 
        onToggle={mockToggle} 
      />
    );
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(mockToggle).toHaveBeenCalledTimes(1);
  });
});

