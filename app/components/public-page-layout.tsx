'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/components/providers/AuthProvider';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';

export function PublicPageLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthContext();
  const [tokenValid, setTokenValid] = useState(true);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setTokenValid(payload.exp * 1000 > Date.now());
      } catch {
        setTokenValid(false);
      }
    } else {
      setTokenValid(false);
    }
  }, [isAuthenticated]);

  const hasValidTokens = () => {
    const localToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const cookieToken = typeof document !== 'undefined'
      ? document.cookie.split(';').find((c) => c.trim().startsWith('token='))
      : null;
    return !!(localToken && cookieToken);
  };

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      const parts = name.split(' ');
      if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      return name.substring(0, 2).toUpperCase();
    }
    if (email) return email.substring(0, 2).toUpperCase();
    return 'U';
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-white text-slate-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),transparent_35%),radial-gradient(circle_at_20%_20%,rgba(14,165,233,0.1),transparent_30%)] pointer-events-none" />

      {/* Sticky Nav - same as home */}
      <nav className="sticky top-0 z-30 backdrop-blur-md border-b border-slate-200/80 bg-white/80">
        <div className="container mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 font-semibold text-lg text-slate-900 hover:opacity-90">
            <span className="h-9 w-9 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center">
              🧾
            </span>
            <span>InvoiceFlow</span>
          </Link>
          <div className="hidden sm:flex items-center gap-6 text-sm text-slate-700">
            <Link href="/" className="hover:text-slate-900 transition">
              Home
            </Link>
            <Link href="/#features" className="hover:text-slate-900 transition">
              Features
            </Link>
            <Link href="/#pricing" className="hover:text-slate-900 transition">
              Pricing
            </Link>
            <Link href="/#about" className="hover:text-slate-900 transition">
              About
            </Link>
            <Link href="/#contact" className="hover:text-slate-900 transition">
              Contact
            </Link>
            <Link href="/terms-and-conditions" className="hover:text-slate-900 transition">
              Terms
            </Link>
            <Link href="/privacy-policy" className="hover:text-slate-900 transition">
              Privacy
            </Link>
          </div>
          <div className="flex items-center gap-2">
            {isAuthenticated && tokenValid && hasValidTokens() && !user?.isSuperAdmin ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 outline-none focus:outline-none cursor-pointer">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      {getInitials(user?.name, user?.email)}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.name || 'Account'}</p>
                      {user?.email && (
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/settings/account">Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-destructive focus:text-destructive"
                  >
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:shadow-sm transition"
                >
                  Login
                </Link>
                <Link
                  href="/try"
                  className="rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-lg hover:shadow-xl hover:scale-[1.02] transition"
                >
                  Try It Free
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Page content */}
      <div className="relative">{children}</div>

      {/* Footer - same as home */}
      <footer className="relative border-t border-slate-200 bg-white/90 backdrop-blur-md mt-auto">
        <div className="container mx-auto max-w-6xl px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-600">
          <div className="flex items-center gap-2 font-semibold text-slate-800">
            <span className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
              🧾
            </span>
            <span>InvoiceFlow</span>
          </div>
          <div className="flex gap-4">
            <Link href="/terms-and-conditions" className="hover:text-slate-900 transition">
              Terms and Conditions
            </Link>
            <Link href="/privacy-policy" className="hover:text-slate-900 transition">
              Privacy Policy
            </Link>
            <Link href="/support" className="hover:text-slate-900 transition">
              Support
            </Link>
          </div>
          <div className="flex gap-3 text-lg text-slate-700">
            <a href="https://twitter.com" className="hover:text-slate-900 transition" aria-label="Twitter">
              𝕏
            </a>
            <a href="https://linkedin.com" className="hover:text-slate-900 transition" aria-label="LinkedIn">
              in
            </a>
            <a href="https://facebook.com" className="hover:text-slate-900 transition" aria-label="Facebook">
              f
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
