import { Site } from '@/types';

/**
 * Fetches the list of sites from the API.
 * @returns A promise that resolves to an array of Site objects.
 * @throws Will throw an error if the network response is not ok.
 */
export async function fetchSites(): Promise<Site[]> {
  const response = await fetch('/api/sites');

  if (!response.ok) {
    // Log the error or handle it more gracefully depending on requirements
    console.error('Failed to fetch sites:', response.status, response.statusText);
    throw new Error(`Failed to fetch sites: ${response.statusText}`);
  }

  const sites: Site[] = await response.json();
  return sites;
}

/**
 * Adds a new site via the API.
 * @param newSiteData - The data for the new site (excluding id).
 * @returns A promise that resolves to the newly created Site object.
 * @throws Will throw an error if the network response is not ok.
 */
// Update parameter type to FormData and adjust fetch options
export async function addSite(formData: FormData): Promise<Site> {
  const response = await fetch('/api/sites', {
    method: 'POST',
    // Remove 'Content-Type' header; fetch sets it automatically for FormData
    body: formData,
  });

  if (!response.ok) {
    console.error('Failed to add site:', response.status, response.statusText);
    throw new Error(`Failed to add site: ${response.statusText}`);
  }

  const newSite: Site = await response.json();
  return newSite;
}

/**
 * Updates an existing site via the API.
 * @param id - The ID of the site to update.
 * @param updatedSiteData - The partial data to update the site with.
 * @returns A promise that resolves to the updated Site object.
 * @throws Will throw an error if the network response is not ok.
 */
// Update parameter type to FormData and adjust fetch options
// Note: We'll need to ensure the PUT handler on the API route can handle FormData
export async function updateSite(id: string, formData: FormData): Promise<Site> {
  const response = await fetch(`/api/sites/${id}`, {
    method: 'PUT',
    // Remove 'Content-Type' header; fetch sets it automatically for FormData
    body: formData,
  });

  if (!response.ok) {
    console.error('Failed to update site:', response.status, response.statusText);
    throw new Error(`Failed to update site: ${response.statusText}`);
  }

  const updatedSite: Site = await response.json();
  return updatedSite;
}

/**
 * Deletes a site via the API.
 * @param id - The ID of the site to delete.
 * @returns A promise that resolves when the deletion is successful.
 * @throws Will throw an error if the network response is not ok.
 */
export async function deleteSite(id: string): Promise<void> {
  const response = await fetch(`/api/sites/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    console.error('Failed to delete site:', response.status, response.statusText);
    throw new Error(`Failed to delete site: ${response.statusText}`);
  }

  // No content expected on successful deletion
}