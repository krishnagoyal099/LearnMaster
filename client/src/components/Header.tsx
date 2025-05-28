import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LoginModal } from "./LoginModal";
import { useTheme } from "./ThemeProvider";
import { Sun, Moon } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";

export function Header() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  return (
    <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-24">
          <div className="flex items-center space-x-8">
            <Link
              href="/"
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity py-4"
            >
              <img src="/logo.png" alt="EduBuddy Logo" className="h-32 w-26" />
              <span className="text-xl font-semibold text-foreground">
                EduBuddy
              </span>
            </Link>
            <nav className="hidden md:flex space-x-6">
              <a
                href="/leaderboard"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Leaderboard
              </a>
              <a
                href="/break"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Break
              </a>
              <Link
                href="/pricing"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Pricing
              </Link>
              <Link
                href="/revision"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Revision
              </Link>
              <Link
                href="/chat"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Chat
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
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  Welcome, {user.name || user.email}
                </span>
                <Button variant="outline" onClick={logout}>
                  Logout
                </Button>
              </div>
            ) : (
              <Button
                className="bg-primary hover:bg-primary/90"
                onClick={() => setShowLoginModal(true)}
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
