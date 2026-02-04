import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Button } from "@/components/ui/button";
import { Music2 } from 'lucide-react';
// 1. Import your new logo
import logo from '@/assets/logo.png'; 

export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Navigation Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            {/* 2. Replace the icon with your logo image */}
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/20 group-hover:scale-105 transition-transform">
              <img src={logo} alt="Sonorus Logo" className="w-5 h-5 object-contain invert" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">Sonorus</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/Browse" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Browse</Link>
            <Link to="/Critics" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Critics</Link>
            {user ? (
              <>
                <Link to="/AddAlbum" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Add Album</Link>
                <Link to="/Profile" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Profile</Link>
                <Button variant="ghost" size="sm" onClick={logout} className="text-zinc-400 hover:text-white">Sign Out</Button>
              </>
            ) : (
              <Link to="/Login">
                <Button size="sm" className="bg-violet-600 hover:bg-violet-700 text-white">Sign In</Button>
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 bg-zinc-900/50 py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            {/* 3. Also update the logo in the footer */}
            <div className="w-6 h-6 rounded bg-zinc-800 flex items-center justify-center">
              <img src={logo} alt="Sonorus Logo" className="w-4 h-4 object-contain invert opacity-50" />
            </div>
            <span className="font-bold text-zinc-400">Sonorus</span>
          </div>
          <p className="text-zinc-500 text-sm">© 2026 Sonorus. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}