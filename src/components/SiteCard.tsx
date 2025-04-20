'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import { Site } from '@/types';
import { useTheme } from '../hooks/useTheme';

interface SiteCardProps {
  site: Site;
  onEdit: (site: Site) => void;
  onDelete: (id: string) => void;
}

const SiteCard: React.FC<SiteCardProps> = ({ site, onEdit, onDelete }) => {
  const { theme } = useTheme();
  // Use a data URI for the placeholder image instead of an external service
  const placeholderImage = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22300%22%20height%3D%22200%22%20viewBox%3D%220%200%20300%20200%22%3E%3Crect%20fill%3D%22%23cccccc%22%20width%3D%22300%22%20height%3D%22200%22%2F%3E%3Ctext%20fill%3D%22%23666666%22%20font-family%3D%22sans-serif%22%20font-size%3D%2220%22%20text-anchor%3D%22middle%22%20x%3D%22150%22%20y%3D%22100%22%3ENo%20Image%3C%2Ftext%3E%3C%2Fsvg%3E';
  const imageUrl = site.thumbnailUrl || placeholderImage;
  const [isHovered, setIsHovered] = useState(false);
  const [isEditButtonHovered, setIsEditButtonHovered] = useState(false);
  const [isDeleteButtonHovered, setIsDeleteButtonHovered] = useState(false);

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering link navigation
    e.preventDefault(); // Prevent default anchor behavior
    onEdit(site);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering link navigation
    e.preventDefault(); // Prevent default anchor behavior
    onDelete(site.id);
  };

  // Card container styles
  const cardContainerStyles = {
    position: 'relative' as const,
    borderRadius: '0.5rem', // rounded-lg
    borderWidth: '1px',
    borderStyle: 'solid' as const,
    borderColor: theme === 'light' ? '#111827' : '#4b5563', // border-gray-200 : dark:border-gray-700
    backgroundColor: theme === 'light' ? '#ffffff' : '#1f2937', // bg-white : dark:bg-gray-800
    boxShadow: isHovered
      ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' // hover:shadow-md
      : '0 1px 2px 0 rgba(0, 0, 0, 0.05)', // shadow-sm
    transition: 'box-shadow 200ms ease-in-out', // transition-shadow duration-200
    overflow: 'hidden', // overflow-hidden
    display: 'flex',
    flexDirection: 'column' as const,
    height: '100%',
    maxWidth: '100%',
  };

  // Link styles
  const linkStyles = {
    display: 'block', // block
  };

  // Image container styles
  const imageContainerStyles = {
    position: 'relative' as const,
    width: '100%',
    height: '6rem', // Reduced height for more square-like appearance
    aspectRatio: '4/3', // Maintain a consistent aspect ratio
  };

  // Image styles
  const imageStyles = {
    transition: 'transform 300ms ease-in-out', // transition-transform duration-300
    transform: isHovered ? 'scale(1.05)' : 'scale(1)', // group-hover:scale-105
  };

  // Content container styles
  const contentContainerStyles = {
    padding: '0 0.75rem 0.75rem 0.75rem', // Removed top padding
    height: '6rem', // Fixed height for consistent card sizes
    overflow: 'hidden',
  };

  // Title styles
  const titleStyles = {
    fontSize: '1rem', // text-base (reduced from text-lg)
    fontWeight: 600, // font-semibold
    color: theme === 'light' ? '#111827' : '#ffffff', // text-gray-900 : dark:text-white
    marginBottom: '0.25rem', // mb-1
    whiteSpace: 'nowrap' as const, // truncate
    overflow: 'hidden' as const,
    textOverflow: 'ellipsis' as const,
  };

  // Description styles
  const descriptionStyles = {
    fontSize: '0.60rem', // text-xs (reduced from text-sm)
    color: theme === 'light' ? '#4b5563' : '#9ca3af', // text-gray-600 : dark:text-gray-400
    display: '-webkit-box' as any,
    WebkitLineClamp: 2, // line-clamp-2
    WebkitBoxOrient: 'vertical' as any,
    overflow: 'hidden',
    lineHeight: '1.2rem', // Tighter line height
  };

  // No description styles
  const noDescriptionStyles = {
    ...descriptionStyles,
    fontStyle: 'italic',
    color: theme === 'light' ? '#9ca3af' : '#6b7280', // text-gray-400 : dark:text-gray-500
  };

  // Action buttons container styles
  const actionButtonsContainerStyles = {
    position: 'absolute' as const,
    top: '0.5rem', // top-2
    right: '0.5rem', // right-2
    display: 'flex',
    gap: '0.25rem', // space-x-1
    opacity: isHovered ? 1 : 0, // opacity-0 group-hover:opacity-100
    transition: 'opacity 200ms ease-in-out', // transition-opacity duration-200
  };

  // Edit button styles
  const editButtonStyles = {
    padding: '0.375rem', // p-1.5
    backgroundColor: theme === 'light' 
      ? (isEditButtonHovered ? '#e5e7eb' : '#f3f4f6') // hover:bg-gray-200 : bg-gray-100
      : (isEditButtonHovered ? '#4b5563' : '#374151'), // dark:hover:bg-gray-600 : dark:bg-gray-700
    borderRadius: '9999px', // rounded-full
    color: theme === 'light'
      ? (isEditButtonHovered ? '#111827' : '#4b5563') // hover:text-gray-900 : text-gray-600
      : (isEditButtonHovered ? '#ffffff' : '#d1d5db'), // dark:hover:text-white : dark:text-gray-300
    outline: 'none', // focus:outline-none
    cursor: 'pointer',
    transition: 'background-color 150ms ease-in-out, color 150ms ease-in-out',
  };

  // Delete button styles
  const deleteButtonStyles = {
    padding: '0.375rem', // p-1.5
    backgroundColor: theme === 'light'
      ? (isDeleteButtonHovered ? '#fee2e2' : '#fee2e2') // hover:bg-red-200 : bg-red-100
      : (isDeleteButtonHovered ? '#991b1b' : '#7f1d1d'), // dark:hover:bg-red-700 : dark:bg-red-800
    borderRadius: '9999px', // rounded-full
    color: theme === 'light'
      ? (isDeleteButtonHovered ? '#7f1d1d' : '#dc2626') // hover:text-red-900 : text-red-600
      : (isDeleteButtonHovered ? '#fee2e2' : '#fca5a5'), // dark:hover:text-red-100 : dark:text-red-300
    outline: 'none', // focus:outline-none
    cursor: 'pointer',
    transition: 'background-color 150ms ease-in-out, color 150ms ease-in-out',
  };

  // SVG icon styles
  const svgIconStyles = {
    height: '1rem', // h-4
    width: '1rem', // w-4
  };

  return (
    <div 
      style={cardContainerStyles}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <a
        href={site.link}
        target="_blank"
        rel="noopener noreferrer"
        style={linkStyles}
      >
        <div style={imageContainerStyles}>
          <Image
            src={imageUrl}
            alt={site.name || 'Site thumbnail'}
            layout="fill"
            objectFit="cover"
            style={imageStyles}
            unoptimized={imageUrl === placeholderImage}
          />
        </div>
        <div style={contentContainerStyles}>
          <h3 style={titleStyles}>
            {site.name}
          </h3>
          <p style={descriptionStyles}>
            {site.description || <span style={noDescriptionStyles}>No description</span>}
          </p>
        </div>
      </a>

      {/* Action Buttons Area */}
      <div style={actionButtonsContainerStyles}>
        {/* Edit Button */}
        <button
          onClick={handleEditClick}
          style={editButtonStyles}
          aria-label={`Edit ${site.name}`}
          onMouseEnter={() => setIsEditButtonHovered(true)}
          onMouseLeave={() => setIsEditButtonHovered(false)}
        >
          {/* Simple Pencil Icon */}
          <svg xmlns="http://www.w3.org/2000/svg" style={svgIconStyles} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
        {/* Delete Button */}
        <button
          onClick={handleDeleteClick}
          style={deleteButtonStyles}
          aria-label={`Delete ${site.name}`}
          onMouseEnter={() => setIsDeleteButtonHovered(true)}
          onMouseLeave={() => setIsDeleteButtonHovered(false)}
        >
          {/* Simple Trash Icon */}
          <svg xmlns="http://www.w3.org/2000/svg" style={svgIconStyles} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default SiteCard;