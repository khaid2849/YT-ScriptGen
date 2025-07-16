import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();

  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-gray-900">
              ScriptGen
            </Link>
            
            <div className="hidden md:flex ml-10 space-x-8">
              <Link
                to="/"
                className={`${
                  isActiveLink('/') ? 'text-blue-600' : 'text-gray-500'
                } hover:text-gray-900 px-3 py-2 text-sm font-medium`}
              >
                Home
              </Link>
              <Link
                to="/generate"
                className={`${
                  isActiveLink('/generate') ? 'text-blue-600' : 'text-gray-500'
                } hover:text-gray-900 px-3 py-2 text-sm font-medium`}
              >
                Generate
              </Link>
              <Link
                to="/contact"
                className={`${
                  isActiveLink('/contact') ? 'text-blue-600' : 'text-gray-500'
                } hover:text-gray-900 px-3 py-2 text-sm font-medium`}
              >
                Contact
              </Link>
            </div>
          </div>

          <div className="flex items-center">
            <span className="text-sm text-gray-600">Free YouTube Script Generator</span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;