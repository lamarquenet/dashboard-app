'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggleButton from './ThemeToggleButton';
import { useTheme } from '../hooks/useTheme';
import React, { useState } from 'react';

export function SideNav() {
  const pathname = usePathname();
  const { theme } = useTheme();
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  // Base styles for all links
  const baseLinkStyle = {
    display: 'block',
    paddingLeft: '1rem',
    paddingRight: '1rem',
    paddingTop: '0.5rem',
    paddingBottom: '0.5rem',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    fontWeight: 500,
    transition: 'color 150ms ease-in-out, background-color 150ms ease-in-out',
  };

  // Function to get link styles based on active state and hover state
  const getLinkStyles = (href: string) => {
    const isActive = pathname === href;
    const isHovered = hoveredLink === href;
    
    // Active state styles
    if (isActive) {
      return {
        ...baseLinkStyle,
        backgroundColor: theme === 'light' ? '#e5e7eb' : '#4b5563', // bg-gray-200 : dark:bg-gray-700
        color: theme === 'light' ? '#111827' : '#ffffff', // text-gray-900 : dark:text-white
      };
    }
    
    // Inactive state styles (with hover effect if hovered)
    return {
      ...baseLinkStyle,
      backgroundColor: isHovered 
        ? (theme === 'light' ? '#f3f4f6' : '#374151') // hover:bg-gray-100 : dark:hover:bg-gray-800
        : 'transparent',
      color: isHovered
        ? (theme === 'light' ? '#111827' : '#ffffff') // hover:text-gray-900 : dark:hover:text-white
        : (theme === 'light' ? '#4b5563' : '#9ca3af'), // text-gray-600 : dark:text-gray-400
    };
  };

  // Nav container styles
  const navStyle = {
    display: 'flex',
    flexDirection: 'column' as const,
    height: '100%',
    padding: '1rem',
    gap: '0.5rem', // space-y-2
    borderRightWidth: '1px',
    borderRightStyle: 'solid' as const, // Explicitly type as const to satisfy TypeScript
    borderRightColor: theme === 'light' ? '#111827' : '#4b5563', // border-gray-200 : dark:border-gray-700
    backgroundColor: theme === 'light' ? '#ffffff' : '#111827', // bg-white : dark:bg-gray-900
  };

  // Links container styles
  const linksContainerStyle = {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.25rem', // space-y-1
  };

  // Theme toggle container styles
  const themeToggleContainerStyle = {
    marginTop: 'auto',
  };

  return (
    <nav style={navStyle}>
      <div style={linksContainerStyle}>
        <Link 
          href="/" 
          style={getLinkStyles('/')}
          onMouseOver={() => setHoveredLink('/')}
          onMouseOut={() => setHoveredLink(null)}
        >
          Sites
        </Link>
        <Link
          href="/chat"
          style={getLinkStyles('/chat')}
          onMouseOver={() => setHoveredLink('/chat')}
          onMouseOut={() => setHoveredLink(null)}
        >
          Chat LLM
        </Link>
      </div>
      <div style={themeToggleContainerStyle}>
        <ThemeToggleButton />
      </div>
    </nav>
  );
}