'use client';

import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextProps {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Initialize state on the client side after mount
  const [theme, setTheme] = useState<Theme>('dark'); // Default theme for SSR
  const [isClient, setIsClient] = useState(false);

  // Effect to set isClient to true after mount and read initial theme
  useEffect(() => {
    setIsClient(true); // Component has mounted on the client
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    const initialTheme = storedTheme || 'dark'; // Use default if nothing stored
    setTheme(initialTheme); // Set theme based on localStorage only on client
  }, []); // Empty dependency array ensures this runs once after mount

  // Effect to update localStorage and html data-theme attribute when theme changes (client-side only)
  useEffect(() => {
    if (isClient) { // Only run on client after initial mount
      const root = window.document.documentElement;
      // Set data-theme attribute instead of class
      root.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
    }
  }, [theme, isClient]); // Re-run when theme changes or after isClient becomes true

  const toggleTheme = useCallback(() => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  }, []);

  // Determine the theme value for the provider:
  // Use the state theme *only if* we are on the client, otherwise use the SSR default.
  // This ensures the initial client render matches the server render.
  const providerValueTheme = isClient ? theme : 'dark';

  return (
    <ThemeContext.Provider value={{ theme: providerValueTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export { ThemeContext }; // Exporting context directly if needed elsewhere, though useTheme is preferred