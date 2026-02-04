import React, { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { AuthContext } from '@/lib/AuthContext';
import { Music2, Search, Plus, MessageSquare, Menu, Users, Rss, LogIn, LogOut, User } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Toaster } from "@/components/ui/sonner";
// 1. Import the logo image
import logo from '@/assets/logo.png';

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
            {/* Logo - UPDATED */}
            <Link 
              to={createPageUrl('Home')} 
              className="flex items-center gap-2 text-white font-bold text-xl"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
                {/* Replaced Music2 icon with Image */}
                <img 
                  src={logo} 
                  alt="Sonorus Logo" 
                  className="w-5 h-5 object-contain invert opacity-90" 
                />
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

              {/* Auth Button (Desktop) */}
              <div className="flex ml-4 pl-4 border-l border-zinc-800 items-center gap-2">
                {user ? (
                  <>
                    <Link to={createPageUrl('Profile')}>
                      <Button 
                        variant="ghost" 
                        className="text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                      >
                        <User className="w-4 h-4 mr-2" />
                        Profile
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      onClick={handleLogout}
                      className="text-zinc-400 hover:text-red-400 hover:bg-red-500/10"
                    >
                      <LogOut className="w-4 h-4" />
                    </Button>
                  </>
                ) : (
                  <Link to={createPageUrl('Login')}>
                    <Button className="bg-violet-600 hover:bg-violet-700">
                      <LogIn className="w-4 h-4 mr-2" />
                      Sign In
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {/* Mobile Menu */}
            <div className="md:hidden">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-zinc-400">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="bg-zinc-900 border-zinc-800 p-0">
                  <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between p-4 border-b border-zinc-800">
                      <span className="text-white font-bold text-lg">Menu</span>
                    </div>
                    <nav className="flex-1 p-4 space-y-2">
                      {navItems.map((item) => (
                        <Link
                          key={item.path}
                          to={createPageUrl(item.path)}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all ${
                            isActive(item.path)
                              ? 'bg-violet-500/20 text-violet-400'
                              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                          }`}
                        >
                          <item.icon className="w-5 h-5" />
                          {item.name}
                        </Link>
                      ))}

                      {/* Auth Button (Mobile) */}
                      <div className="pt-4 mt-4 border-t border-zinc-800">
                        {user ? (
                          <>
                            <Link
                              to={createPageUrl('Profile')}
                              onClick={() => setMobileMenuOpen(false)}
                              className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-all mb-2"
                            >
                              <User className="w-5 h-5" />
                              Profile
                            </Link>

                            <button
                              onClick={() => {
                                setMobileMenuOpen(false);
                                handleLogout();
                              }}
                              className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-red-400 hover:bg-red-500/10 transition-all"
                            >
                              <LogOut className="w-5 h-5" />
                              Log Out
                            </button>
                          </>
                        ) : (
                          <Link
                            to={createPageUrl('Login')}
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium bg-violet-600 text-white"
                          >
                            <LogIn className="w-5 h-5" />
                            Sign In
                          </Link>
                        )}
                      </div>
                    </nav>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/50 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-zinc-500">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                 {/* Replaced Music2 icon with Image */}
                <img 
                  src={logo} 
                  alt="Sonorus" 
                  className="w-3.5 h-3.5 object-contain invert opacity-75" 
                />
              </div>
              <span className="text-sm">Sonorus • Community Music Reviews</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-zinc-500">
              <span>Share your music opinions</span>
            </div>
          </div>
        </div>
      </footer>

      <Toaster richColors position="top-center" />
    </div>
  );
}