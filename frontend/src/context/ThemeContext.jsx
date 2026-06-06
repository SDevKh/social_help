import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext({ isDark: false, toggleTheme: () => {} });

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', 'light');
    }
    try { localStorage.setItem('sf-theme', isDark ? 'dark' : 'light'); } catch {}
  }, [isDark]);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme: () => setIsDark(d => !d) }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
