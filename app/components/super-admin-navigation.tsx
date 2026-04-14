'use client';

import { useCallback, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { useAuthContext } from '@/components/providers/AuthProvider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface NavItem {
  href: string;
  label: string;
}

const navItems: NavItem[] = [
  { href: '/super-admin', label: 'Dashboard' },
  { href: '/super-admin/users', label: 'Users' },
  { href: '/super-admin/tenants', label: 'Tenants' },
  { href: '/super-admin/catalog-categories', label: 'Catalog Categories' },
  { href: '/super-admin/analytics', label: 'Analytics' },
  { href: '/super-admin/whatsapp-flows', label: 'WhatsApp Flows' },
  { href: '/super-admin/settings', label: 'Settings' },
];

export function SuperAdminNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthContext();

  const handleLogout = useCallback(() => {
    logout();
    router.push('/');
  }, [logout, router]);

  const getInitials = useCallback((name?: string, email?: string) => {
    if (name) {
      const parts = name.split(' ');
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    }
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    return 'SA';
  }, []);

  const avatarInitials = useMemo(() => {
    return getInitials(user?.name, user?.email);
  }, [user?.name, user?.email, getInitials]);

  return (
    <nav className="border-b border-border bg-card">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/super-admin" className="text-xl font-bold text-red-600">
              Super Admin
            </Link>
            <div className="hidden md:flex gap-4">
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/super-admin' && pathname?.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-red-100 text-red-700'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 outline-none focus:outline-none cursor-pointer">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-red-600 text-white text-sm">
                    {avatarInitials}
                  </AvatarFallback>
                </Avatar>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.name || 'Super Admin'}
                    </p>
                    {user?.email && (
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}