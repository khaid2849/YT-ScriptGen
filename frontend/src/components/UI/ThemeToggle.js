import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`relative inline-flex items-center justify-center w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
        theme === 'dark' 
          ? 'bg-blue-600 hover:bg-blue-700' 
          : 'bg-gray-200 hover:bg-gray-300'
      } ${className}`}
      aria-label="Toggle theme"
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {/* Switch Circle */}
      <span
        className={`absolute inline-block w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
          theme === 'dark' ? 'translate-x-3' : '-translate-x-3'
        }`}
      >
        {/* Icons */}
        <span className="absolute inset-0 flex items-center justify-center">
          {theme === 'light' ? (
            <Sun className="w-3 h-3 text-yellow-500" />
          ) : (
            <Moon className="w-3 h-3 text-blue-600" />
          )}
        </span>
      </span>
    </button>
  );
};

export default ThemeToggle;