import React, { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { AuthContext } from '@/lib/AuthContext';
import { Music2, Search, Plus, MessageSquare, Menu, Users, Rss, LogIn, LogOut, User } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Toaster } from "@/components/ui/sonner";

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  
  // Connect to Auth Context
  const { user, logout } = useContext(AuthContext);

  const navItems = [
    { name: 'Home', path: 'Home', icon: Music2 },
    { name: 'Browse', path: 'Browse', icon: Search },
    { name: 'Reviews', path: 'RecentReviews', icon: MessageSquare },
    { name: 'Critics', path: 'Critics', icon: Users },
    { name: 'Following', path: 'Following', icon: Rss },
    { name: 'Add Album', path: 'AddAlbum', icon: Plus },
  ];

  const isActive = (path) => location.pathname.includes(path);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link 
              to={createPageUrl('Home')} 
              className="flex items-center gap-2 text-white font-bold text-xl"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                <Music2 className="w-5 h-5 text-white" />
              </div>
              <span className="hidden sm:block">Sonorus</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={createPageUrl(item.path)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive(item.path)
                      ? 'bg-violet-500/20 text-violet-400'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Link>
              ))}

              {/* Auth Button (Desktop