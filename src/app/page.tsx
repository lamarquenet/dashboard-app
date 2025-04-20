'use client'; // Mark as a Client Component

import React, { useState, useEffect, useCallback } from 'react';
import { Site } from '@/types';
import { fetchSites, addSite, updateSite, deleteSite } from '@/lib/services/siteService';
import SiteCard from '@/components/SiteCard';
import Modal from '@/components/Modal';
import SiteForm, { SiteFormData } from '@/components/SiteForm';
import { useTheme } from '../hooks/useTheme';

export default function HomePage() {
  const { theme } = useTheme();
  const [sites, setSites] = useState<Site[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editingSite, setEditingSite] = useState<Site | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isAddButtonHovered, setIsAddButtonHovered] = useState<boolean>(false);

  useEffect(() => {
    const loadSites = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedSites = await fetchSites();
        setSites(fetchedSites);
      } catch (err) {
        console.error("Error fetching sites:", err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    loadSites();
  }, []);

  // --- Add Site Handlers ---
  const handleAddModalOpen = () => {
    setError(null);
    setIsAddModalOpen(true);
  };

  const handleAddModalClose = useCallback(() => {
    setIsAddModalOpen(false);
  }, []);

  // Update parameter type to FormData
  const handleAddSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const newSite = await addSite(formData);
      setSites(prevSites => [...prevSites, newSite]);
      handleAddModalClose();
    } catch (err) {
      console.error("Error adding site:", err);
      setError(err instanceof Error ? err.message : 'Failed to add site');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Edit Site Handlers ---
  const handleEditModalOpen = useCallback((siteToEdit: Site) => {
    setError(null);
    setEditingSite(siteToEdit);
    setIsEditModalOpen(true);
  }, []);

  const handleEditModalClose = useCallback(() => {
    setIsEditModalOpen(false);
    setEditingSite(null);
  }, []);

  // Update parameter type to FormData
  const handleEditSubmit = async (formData: FormData) => {
    if (!editingSite) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const updatedSite = await updateSite(editingSite.id, formData);
      setSites(prevSites =>
        prevSites.map(site => (site.id === updatedSite.id ? updatedSite : site))
      );
      handleEditModalClose();
    } catch (err) {
      console.error("Error updating site:", err);
      setError(err instanceof Error ? err.message : 'Failed to update site');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Delete Site Handler ---
  const handleDeleteSite = async (id: string) => {
    const siteNameToDelete = sites.find(site => site.id === id)?.name || 'this site';

    if (!window.confirm(`Are you sure you want to delete "${siteNameToDelete}"? This action cannot be undone.`)) {
      return;
    }

    setError(null);
    try {
      await deleteSite(id);
      setSites(prevSites => prevSites.filter(site => site.id !== id));
    } catch (err) {
      console.error("Error deleting site:", err);
      setError(err instanceof Error ? err.message : 'Failed to delete site');
    }
  };

  // Container styles
  const containerStyles = {
    padding: '1rem', // p-4
    // Media queries aren't supported in React inline styles
    // Using fixed padding instead
  };

  // Heading styles
  const headingStyles = {
    fontSize: '1.5rem', // text-2xl
    fontWeight: 'bold',
    marginBottom: '1.5rem', // mb-6
    color: theme === 'light' ? '#111827' : '#ffffff', // text-gray-900 dark:text-white
    // Media queries aren't supported in React inline styles
  };

  // Button container styles
  const buttonContainerStyles = {
    marginBottom: '1.5rem', // mb-6
    display: 'flex',
    justifyContent: 'flex-end', // justify-end
  };

  // Add button styles
  const addButtonStyles = {
    paddingLeft: '1rem', // px-4
    paddingRight: '1rem',
    paddingTop: '0.5rem', // py-2
    paddingBottom: '0.5rem',
    backgroundColor: isAddButtonHovered ? '#4f46e5' : '#4f46e5', // hover:bg-indigo-700 : bg-indigo-600
    color: '#ffffff', // text-white
    borderRadius: '0.375rem', // rounded-md
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', // shadow-sm
    outline: 'none', // focus:outline-none
    cursor: 'pointer',
    transition: 'background-color 150ms ease-in-out',
  };

  // Loading/empty container styles
  const centerContainerStyles = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '10rem', // h-40
  };

  // Loading/empty text styles
  const mutedTextStyles = {
    color: theme === 'light' ? '#4b5563' : '#9ca3af', // text-gray-600 dark:text-gray-400
  };

  // Error container styles
  const errorContainerStyles = {
    ...centerContainerStyles,
    backgroundColor: theme === 'light' ? '#fee2e2' : '#7f1d1d', // bg-red-100 dark:bg-red-900
    borderWidth: '1px',
    borderStyle: 'solid' as const,
    borderColor: theme === 'light' ? '#f87171' : '#b91c1c', // border-red-400 dark:border-red-700
    color: theme === 'light' ? '#b91c1c' : '#fecaca', // text-red-700 dark:text-red-200
    padding: '0.75rem 1rem', // px-4 py-3
    borderRadius: '0.375rem', // rounded
    position: 'relative' as const,
  };

  // Error bold text styles
  const errorBoldTextStyles = {
    fontWeight: 'bold',
    marginRight: '0.5rem', // mr-2
  };

  // Error text styles
  const errorTextStyles = {
    display: 'block',
    // Media queries aren't supported in React inline styles
  };

  // Grid container styles - using CSS custom properties for responsive behavior
  const gridContainerStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', // Responsive grid with minimum card width of 250px
    gap: '1rem', // gap-4
    width: '100%',
    maxWidth: '1200px', // Limit maximum width to prevent too wide cards on large screens
    margin: '0 auto', // Center the grid
  };

  // Modal error styles
  const modalErrorStyles = {
    marginBottom: '1rem', // mb-4
    backgroundColor: theme === 'light' ? '#fee2e2' : '#7f1d1d', // bg-red-100 dark:bg-red-900
    borderWidth: '1px',
    borderStyle: 'solid' as const,
    borderColor: theme === 'light' ? '#f87171' : '#b91c1c', // border-red-400 dark:border-red-700
    color: theme === 'light' ? '#b91c1c' : '#fecaca', // text-red-700 dark:text-red-200
    padding: '0.5rem 1rem', // px-4 py-2
    borderRadius: '0.375rem', // rounded
    fontSize: '0.875rem', // text-sm
  };

  return (
    <div style={containerStyles}>
      <h1 style={headingStyles}>
        Available Sites
      </h1>

      {/* Add New Site Button */}
      <div style={buttonContainerStyles}>
        <button
          onClick={handleAddModalOpen}
          style={addButtonStyles}
          onMouseOver={() => setIsAddButtonHovered(true)}
          onMouseOut={() => setIsAddButtonHovered(false)}
        >
          Add New Site
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div style={centerContainerStyles}>
          <p style={mutedTextStyles}>Loading sites...</p>
        </div>
      )}

      {error && (
        <div style={errorContainerStyles} role="alert">
          <strong style={errorBoldTextStyles}>Error:</strong>
          <span style={errorTextStyles}>{error}</span>
        </div>
      )}

      {!isLoading && !error && sites.length === 0 && (
         <div style={centerContainerStyles}>
           <p style={mutedTextStyles}>No sites available.</p>
         </div>
      )}

      {!isLoading && !error && sites.length > 0 && (
        <div style={gridContainerStyles}>
          {sites.map((site) => (
            <SiteCard key={site.id} site={site} onEdit={handleEditModalOpen} onDelete={handleDeleteSite} />
          ))}
        </div>
      )}

      {/* Add Site Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={handleAddModalClose}
        title="Add New Site"
      >
        {/* Display error within the modal if it occurred during submission */}
        {error && !isSubmitting && (
           <div style={modalErrorStyles} role="alert">
             {error}
           </div>
        )}
        <SiteForm
          onSubmit={handleAddSubmit}
          onCancel={handleAddModalClose}
          isSubmitting={isSubmitting}
        />
      </Modal>

      {/* Edit Site Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={handleEditModalClose}
        title={`Edit Site: ${editingSite?.name || ''}`}
      >
        {/* Display error within the modal if it occurred during submission */}
        {error && !isSubmitting && (
           <div style={modalErrorStyles} role="alert">
             {error}
           </div>
        )}
        <SiteForm
          initialData={editingSite}
          onSubmit={handleEditSubmit}
          onCancel={handleEditModalClose}
          isSubmitting={isSubmitting}
        />
      </Modal>
    </div>
  );
}
