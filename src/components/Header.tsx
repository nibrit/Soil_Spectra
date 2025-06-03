import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Microscope, Menu, X } from 'lucide-react';

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  return (
    <header 
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <Microscope className="h-8 w-8 text-green-700" />
            <span className="text-2xl font-bold text-green-800">Soil Spectra</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <NavLink to="/" active={location.pathname === '/'}>Home</NavLink>
            <NavLink to="/analyze" active={location.pathname === '/analyze'}>Analyze Soil</NavLink>
            <NavLink to="/education" active={location.pathname === '/education'}>Education</NavLink>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-green-800 hover:text-green-600 transition-colors"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 flex flex-col space-y-4">
            <NavLink to="/" active={location.pathname === '/'}>Home</NavLink>
            <NavLink to="/analyze" active={location.pathname === '/analyze'}>Analyze Soil</NavLink>
            <NavLink to="/education" active={location.pathname === '/education'}>Education</NavLink>
          </nav>
        )}
      </div>
    </header>
  );
};

interface NavLinkProps {
  to: string;
  active: boolean;
  children: React.ReactNode;
}

const NavLink: React.FC<NavLinkProps> = ({ to, active, children }) => (
  <Link
    to={to}
    className={`relative px-2 py-1 font-medium text-lg transition-colors
      ${active 
        ? 'text-green-700 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-green-600' 
        : 'text-gray-700 hover:text-green-600'}`}
  >
    {children}
  </Link>
);