import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Sprout, ScanLine, BookOpen, History, Info, Menu, X, ShieldCheck } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: 'Home', path: '/', icon: Sprout },
    { name: 'Detect Disease', path: '/detect', icon: ScanLine },
    { name: 'Disease Guide', path: '/guide', icon: BookOpen },
    { name: 'History', path: '/history', icon: History },
    { name: 'About AI Model', path: '/about', icon: Info }
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-emerald-100/80 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo & Brand Name */}
          <Link to="/" className="flex items-center gap-3.5 group">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center text-white shadow-md shadow-emerald-900/15 group-hover:scale-105 transition-transform">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                  PotatoCare <span className="text-emerald-700">AI</span>
                </span>
                <span className="text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-md border border-emerald-200">
                  v2.0
                </span>
              </div>
              <span className="block text-xs font-semibold text-emerald-700 tracking-wide">
                Leaf Disease Detection System
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-800 shadow-sm border border-emerald-200/80'
                        : 'text-slate-600 hover:text-emerald-800 hover:bg-emerald-50/50'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </NavLink>
              );
            })}
          </div>

          {/* CTA Action Button */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/detect"
              className="inline-flex items-center gap-2 bg-emerald-800 hover:bg-emerald-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md shadow-emerald-900/20 hover:shadow-emerald-900/30 transition-all transform active:scale-95"
            >
              <ScanLine className="w-4 h-4" />
              Analyze Leaf
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2.5 rounded-xl text-slate-700 hover:text-emerald-800 hover:bg-emerald-50 focus:outline-none transition-colors"
              aria-label="Toggle navigation menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="lg:hidden bg-white/98 backdrop-blur-md border-b border-emerald-100 px-4 pt-3 pb-6 space-y-2 animate-fadeIn">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-2xl text-base font-semibold transition-colors ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-sm'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`
                }
              >
                <Icon className="w-5 h-5 text-emerald-700" />
                {item.name}
              </NavLink>
            );
          })}
          <div className="pt-3">
            <Link
              to="/detect"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center justify-center gap-2 bg-emerald-800 hover:bg-emerald-900 text-white py-3.5 rounded-2xl font-bold text-base shadow-md"
            >
              <ScanLine className="w-5 h-5" />
              Analyze Leaf Now
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
