'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Button from '@/components/Button';
import { FaTimes, FaBars, FaCoins } from 'react-icons/fa';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menu when a link is clicked
  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className={`relative w-full top-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-gray-900/95 backdrop-blur-md border-b border-blue-700/30 py-2' 
        : 'bg-gray-900/90 backdrop-blur-sm border-b border-blue-800/30 py-3'
    }`}>
      <nav className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo - Fixed alignment */}
          <Link href="/" className="flex items-center z-50">
            <div className="w-20 h-10 relative mr-2 flex-shrink-0">
              <Image
                src="/logo.png"
                alt="BeeCoin Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent whitespace-nowrap">
              BeeCoin
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex space-x-1 xl:space-x-2">
            <Link href="/" className="text-gray-300 hover:text-blue-400 transition-colors px-3 py-2 text-sm xl:text-base">
              Home
            </Link>
            <Link href="/about" className="text-gray-300 hover:text-purple-400 transition-colors px-3 py-2 text-sm xl:text-base">
              About
            </Link>
            <Link href="/features" className="text-gray-300 hover:text-cyan-400 transition-colors px-3 py-2 text-sm xl:text-base">
              Features
            </Link>
            <Link href="/pricing" className="text-gray-300 hover:text-blue-400 transition-colors px-3 py-2 text-sm xl:text-base">
              Pricing
            </Link>
            <div className="flex items-center space-x-1 xl:space-x-2 ml-2">
              <Link href="/login" className="text-gray-300 hover:text-purple-400 transition-colors px-3 py-2 text-sm xl:text-base">
                Login
              </Link>
              <Button
                href="/register"
                variant="primary"
                size="sm"
                className="px-3 xl:px-4"
              >
                Register
              </Button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <Button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              variant="secondary"
              size="sm"
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <FaTimes className="w-4 h-4" /> : <FaBars className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu dropdown - appears below header */}
        <div 
          ref={menuRef}
          className={`lg:hidden absolute left-0 right-0 bg-gray-900/95 backdrop-blur-md border-b border-blue-700/30 transition-all duration-300 overflow-hidden ${
            isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col space-y-4">
              <Link 
                href="/" 
                className="text-gray-300 hover:text-blue-400 transition-colors py-2"
                onClick={handleLinkClick}
              >
                Home
              </Link>
              <Link 
                href="/about" 
                className="text-gray-300 hover:text-purple-400 transition-colors py-2"
                onClick={handleLinkClick}
              >
                About
              </Link>
              <Link 
                href="/features" 
                className="text-gray-300 hover:text-cyan-400 transition-colors py-2"
                onClick={handleLinkClick}
              >
                Features
              </Link>
              <Link 
                href="/pricing" 
                className="text-gray-300 hover:text-blue-400 transition-colors py-2"
                onClick={handleLinkClick}
              >
                Pricing
              </Link>
              <div className="pt-2 border-t border-blue-700/30 flex flex-col space-y-3">
                <Link 
                  href="/login" 
                  className="text-gray-300 hover:text-purple-400 transition-colors py-2"
                  onClick={handleLinkClick}
                >
                  Login
                </Link>
                <Button
                  href="/register"
                  variant="primary"
                  size="sm"
                  className="w-full justify-center"
                  onClick={handleLinkClick}
                >
                  Register
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}