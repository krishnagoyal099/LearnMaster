import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LoginModal } from "./LoginModal";
import { useTheme } from "./ThemeProvider";
import { Sun, Moon } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";

export function Header({ onLogoClick }: { onLogoClick?: () => void }) {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();

  const handleLogoClick = () => {
    if (location === "/") {
      window.location.reload();
    } else {
      setLocation("/");
    }
    if (onLogoClick) onLogoClick();
  };

  return (
    <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-24">
          <div className="flex items-center space-x-8">
            <div
              className="cursor-pointer flex items-center space-x-3 hover:opacity-80 transition-all duration-300 py-4"
              onClick={handleLogoClick}
            >
              <img src="/logo.png" alt="EduBuddy Logo" className="h-32 w-26" />
              <span className="text-2xl font-bold text-foreground tracking-tight">
                EduBuddy
              </span>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <a
                href="/leaderboard"
                className="text-base font-medium text-muted-foreground hover:text-primary transition-all duration-300 relative group"
              >
                Leaderboard
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-600 to-fuchsia-600 group-hover:w-full transition-all duration-300 ease-out"></span>
              </a>
              <a
                href="/find-resources"
                className="text-base font-medium text-muted-foreground hover:text-primary transition-all duration-300 relative group"
              >
                Find Resources
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-600 to-fuchsia-600 group-hover:w-full transition-all duration-300 ease-out"></span>
              </a>
              <a
                href="/break"
                className="text-base font-medium text-muted-foreground hover:text-primary transition-all duration-300 relative group"
              >
                Break
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-600 to-fuchsia-600 group-hover:w-full transition-all duration-300 ease-out"></span>
              </a>
              <Link
                href="/pricing"
                className="text-base font-medium text-muted-foreground hover:text-primary transition-all duration-300 relative group"
              >
                Pricing
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-600 to-fuchsia-600 group-hover:w-full transition-all duration-300 ease-out"></span>
              </Link>
              <Link
                href="/revision"
                className="text-base font-medium text-muted-foreground hover:text-primary transition-all duration-300 relative group"
              >
                Revision
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-600 to-fuchsia-600 group-hover:w-full transition-all duration-300 ease-out"></span>
              </Link>
              <Link
                href="/chat"
                className="text-base font-medium text-muted-foreground hover:text-primary transition-all duration-300 relative group"
              >
                Chat
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-600 to-fuchsia-600 group-hover:w-full transition-all duration-300 ease-out"></span>
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              className="bg-muted hover:bg-accent"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>

            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-muted-foreground">
                  Welcome, {user.name || user.email}
                </span>
                <Button
                  variant="outline"
                  onClick={logout}
                  className="font-medium hover:bg-accent/80 transition-all duration-300"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => setShowLoginModal(true)}
                className="bg-gradient-to-r from-purple-900 via-purple-700 to-fuchsia-600 hover:from-purple-800 hover:via-purple-600 hover:to-fuchsia-500 text-white border-none shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Login
              </Button>
            )}
          </div>
        </div>
      </div>
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </header>
  );
}
