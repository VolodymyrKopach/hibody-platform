'use client';

import React from 'react';
import Link, { LinkProps } from 'next/link';
import { useUnsavedChangesContext } from '@/providers/UnsavedChangesProvider';

interface SafeLinkProps extends Omit<LinkProps, 'onClick'> {
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

const SafeLink: React.FC<SafeLinkProps> = ({ 
  href, 
  children, 
  onClick, 
  ...props 
}) => {
  const { navigateWithConfirmation } = useUnsavedChangesContext();

  const handleClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    
    // Call custom onClick if provided
    if (onClick) {
      onClick(e);
    }

    // Navigate with confirmation
    await navigateWithConfirmation(href.toString());
  };

  return (
    <Link href={href} {...props} onClick={handleClick}>
      {children}
    </Link>
  );
};

export default SafeLink;
