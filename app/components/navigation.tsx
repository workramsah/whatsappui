'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Bell,
  Building2,
  ChevronDown,
  CreditCard,
  FileText,
  Headphones,
  LayoutDashboard,
  MessageSquare,
  Menu,
  Package,
  Plus,
  Search,
  ShoppingCart,
  Users,
  Zap,
} from 'lucide-react';
import { useAuthContext } from '@/components/providers/AuthProvider';
import { apiRequest } from '@/lib/api';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { DashboardLayout, MainContent } from '@/components/dashboard/DashboardLayout';
import { DashboardSidebar, type DashboardSidebarSection } from '@/components/dashboard/DashboardSidebar';
import { DashboardTopNavbar } from '@/components/dashboard/DashboardTopNavbar';

interface NavItem {
  href: string;
  label: string;
}

const baseNavItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/order-input', label: 'Order' },
  { href: '/customers', label: 'Customers' },
  { href: '/products', label: 'Products' },
  { href: '/conversations/messages', label: 'Messages' },
  { href: '/automation', label: 'Automation' },
  { href: '/template', label: 'Template' },
  { href: '/price-lists', label: 'Price Lists' },
  { href: '/workflows', label: 'Workflows' },
  { href: '/dashboard/bookings', label: 'Bookings' },
  { href: '/dashboard/flow-builder', label: 'Flow Builder' },
  { href: '/catalog', label: 'Catalog' },
  { href: '/checkout', label: 'Checkout' },
  { href: '/offers', label: 'Offers' },
];

interface TenantProfile {
  logoUrl: string | null;
  companyName: string | null;
  trackPayments?: boolean;
}

interface Membership {
  tenantId: string;
  role: 'ADMIN' | 'STAFF';
  tenant: {
    id: string;
    name: string;
  };
}

export function Navigation({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, tenant, logout, isAuthenticated, isCompanyAdmin, refreshUser } = useAuthContext();
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [creditModuleEnabled, setCreditModuleEnabled] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [switchingTenant, setSwitchingTenant] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    
    const loadCompanyProfile = async () => {
      try {
        const profile = await apiRequest<TenantProfile>('/settings/company');
        if (mounted) {
          setCompanyLogo(profile.logoUrl);
          setCompanyName(profile.companyName);
          setCreditModuleEnabled(profile.trackPayments ?? false);
          setLogoError(false);
        }
      } catch (error) {
        if (mounted) {
          console.log('Company profile not found');
        }
      }
    };

    const loadMemberships = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const response = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        if (mounted && data.memberships) {
          setMemberships(data.memberships);
        }
      } catch (error) {
        console.error('Failed to load memberships:', error);
      }
    };

    loadCompanyProfile();
    loadMemberships();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'companyProfileUpdated' && mounted) {
        loadCompanyProfile();
        if (typeof window !== 'undefined') {
          localStorage.removeItem('companyProfileUpdated');
        }
      }
    };

    const handleProfileUpdate = () => {
      if (mounted) {
        loadCompanyProfile();
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
      window.addEventListener('companyProfileUpdated', handleProfileUpdate);
    }

    return () => {
      mounted = false;
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('companyProfileUpdated', handleProfileUpdate);
      }
    };
  }, []);

  const handleTenantSwitch = async (tenantId: string) => {
    if (switchingTenant) return;
    
    setSwitchingTenant(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await fetch('/api/auth/switch-company', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ tenantId })
      });
      
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        await refreshUser();
        toast.success(`Switched to ${data.tenant.name}`);
        router.push('/dashboard');
      } else {
        toast.error(data.error || 'Failed to switch company');
      }
    } catch (error) {
      toast.error('Failed to switch company');
    } finally {
      setSwitchingTenant(false);
    }
  };

  const navItems = useMemo(() => {
    const items: NavItem[] = [...baseNavItems];
    
    if (creditModuleEnabled) {
      items.push({ href: '/balances', label: 'Balances' });
    }
    return items;
  }, [creditModuleEnabled]);

  const handleLogout = useCallback(() => {
    sessionStorage.clear();
    logout();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('authChange'));
    }
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
    return 'U';
  }, []);

  const handleImageError = useCallback(() => {
    setLogoError(true);
  }, []);

  useEffect(() => {
    setLogoError(false);
  }, [companyLogo]);

  const avatarInitials = useMemo(() => {
    return getInitials(user?.name, user?.email);
  }, [user?.name, user?.email, getInitials]);

  const otherMemberships = memberships.filter(m => m.tenantId !== tenant?.id);
  const showTenantSwitch = otherMemberships.length > 0;
  const showLogo = companyLogo && !logoError && companyLogo.trim() !== '';

  const isActiveHref = (href: string) => {
    if (href === '/' && pathname === '/') return true;
    if (href !== '/' && pathname?.startsWith(href)) return true;
    return false;
  };

  const sidebarSections = useMemo<DashboardSidebarSection[]>(() => {
    const getItem = (href: string) => navItems.find((i) => i.href === href);
    const toSectionItem = (href: string, icon: DashboardSidebarSection["items"][number]["icon"]) => {
      const item = getItem(href);
      if (!item) return null;
      return { name: item.label, href: item.href, icon };
    };

    const sections: DashboardSidebarSection[] = [
      {
        section: 'DASHBOARD',
        items: [toSectionItem('/dashboard', LayoutDashboard)].filter(Boolean) as any,
      },
      {
        section: 'ORDERS',
        items: [
          toSectionItem('/order-input', ShoppingCart),
          toSectionItem('/dashboard/bookings', FileText),
          toSectionItem('/checkout', CreditCard),
        ].filter(Boolean) as any,
      },
      {
        section: 'CUSTOMERS',
        items: [toSectionItem('/customers', Users)].filter(Boolean) as any,
      },
      {
        section: 'CONVERSATION',
        items: [toSectionItem('/conversations/messages', MessageSquare)].filter(Boolean) as any,
      },
      {
        section: 'PRODUCTS',
        items: [
          toSectionItem('/products', Package),
          toSectionItem('/price-lists', FileText),
        ].filter(Boolean) as any,
      },
      {
        section: 'MARKETING',
        items: [
          toSectionItem('/template', FileText),
          toSectionItem('/workflows', Zap),
          toSectionItem('/automation', Zap),
          toSectionItem('/dashboard/flow-builder', FileText),
          toSectionItem('/catalog', Package),
          toSectionItem('/offers', Zap),
        ].filter(Boolean) as any,
      },
      {
        section: 'BILLING',
        items: [toSectionItem('/balances', CreditCard)].filter(Boolean) as any,
      },
    ];

    return sections.filter((s) => s.items.length > 0);
  }, [navItems]);

  const mobileBottomNavItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Order', href: '/order-input', icon: ShoppingCart },
    { name: 'Customers', href: '/customers', icon: Users },
    { name: 'Products', href: '/products', icon: Package },
    { name: 'Menu', href: '/automation', icon: Zap },
  ] as const;

  return (
    <>
      {switchingTenant && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="text-lg font-medium">Switching Company...</span>
          </div>
        </div>
      )}
      <DashboardLayout>
        <DashboardSidebar
          companyName={companyName}
          sidebarSections={sidebarSections}
          isActive={isActiveHref}
        />
        <div className="flex-1 flex flex-col">
          <DashboardTopNavbar
            mobileHeader={
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Dialog open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                    <DialogTrigger asChild>
                      <button className="p-2 hover:bg-[#f5f5f5] rounded-lg transition-colors" type="button" aria-label="Open menu">
                        <Menu className="w-5 h-5 text-[#716f70]" />
                      </button>
                    </DialogTrigger>
                    <DialogContent className="p-0 max-w-[340px] overflow-hidden">
                      <div className="p-4 max-h-[80vh] overflow-y-auto">
                        <div className="mb-4 px-1 text-[11px] font-semibold text-[#9e9d9d] tracking-wide">
                          MENU
                        </div>
                        {sidebarSections.map((section) => (
                          <div key={section.section} className="mb-6">
                            <h3 className="px-1 text-[11px] font-semibold text-[#9e9d9d] mb-2 tracking-wide">
                              {section.section}
                            </h3>
                            <div className="space-y-1">
                              {section.items.map((item) => {
                                const Icon = item.icon;
                                const active = isActiveHref(item.href);
                                return (
                                  <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                                      active
                                        ? "bg-[#e8f5ec] text-[#1da750]"
                                        : "text-[#716f70] hover:bg-[#f5f5f5]"
                                    }`}
                                  >
                                    <Icon className={`w-4 h-4 ${active ? "text-[#1da750]" : "text-[#716f70]"}`} />
                                    <span className="text-[14px]">{item.name}</span>
                                  </Link>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>

                  <button className="flex items-center gap-2 bg-[#f8faf8] border border-[#1c9f43] rounded-lg px-2.5 py-1.5">
                    <div className="w-5 h-5 bg-[#00a85a] rounded-full flex items-center justify-center">
                      <span className="text-white text-[10px] font-bold">
                        {(companyName || "B")
                          .split(" ")
                          .filter(Boolean)
                          .slice(0, 2)
                          .map((p) => p[0]?.toUpperCase())
                          .join("") || "B"}
                      </span>
                    </div>
                    <span className="text-[13px] font-bold text-[#1d1b1c]">{companyName || "Bhatbhateni"}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-[#464445]" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-[#f5f5f5] rounded-lg transition-colors" type="button">
                    <Search className="w-5 h-5 text-[#716f70]" />
                  </button>
                  <button className="p-2 hover:bg-[#f5f5f5] rounded-lg transition-colors" type="button">
                    <Bell className="w-5 h-5 text-[#716f70]" />
                  </button>

                  {isAuthenticated && user ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger className="flex items-center gap-2 outline-none focus:outline-none cursor-pointer">
                        <Avatar className="h-8 w-8">
                          {showLogo && (
                            <AvatarImage
                              src={companyLogo!}
                              alt={companyName || "Company Logo"}
                              onError={handleImageError}
                            />
                          )}
                          <AvatarFallback className="bg-[#1da750] text-white text-xs font-semibold">
                            {showLogo ? null : avatarInitials}
                          </AvatarFallback>
                        </Avatar>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>
                          <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{user?.name || "Account"}</p>
                            {user?.email && (
                              <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                            )}
                            {tenant?.name && (
                              <p className="text-xs leading-none text-muted-foreground">Company: {tenant.name}</p>
                            )}
                          </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {showTenantSwitch && (
                          <>
                            <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
                              Switch Company
                            </DropdownMenuLabel>
                            {otherMemberships.map((membership) => (
                              <DropdownMenuItem
                                key={membership.tenantId}
                                onClick={() => handleTenantSwitch(membership.tenantId)}
                                className={`cursor-pointer ${switchingTenant ? "opacity-50 pointer-events-none" : ""}`}
                              >
                                <Building2 className="h-4 w-4 mr-2" />
                                {switchingTenant ? "Switching..." : membership.tenant.name}
                              </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator />
                          </>
                        )}
                        <DropdownMenuItem asChild className="cursor-pointer">
                          <Link href="/settings/account">Account</Link>
                        </DropdownMenuItem>
                        {isCompanyAdmin && (
                          <>
                            <DropdownMenuItem asChild className="cursor-pointer">
                              <Link href="/settings/company">Company Settings</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild className="cursor-pointer">
                              <Link href="/dashboard/staff">Staff</Link>
                            </DropdownMenuItem>
                          </>
                        )}
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
                    <Button onClick={() => router.push("/")} className="px-2 py-2 h-9" type="button">
                      Login
                    </Button>
                  )}
                </div>
              </div>
            }
            desktopHeader={
              <>
                <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
                  <Link
                    href="/order-input"
                    className="group flex items-center gap-2 h-11 rounded-lg px-3 text-[13px] font-medium text-[#454545] hover:bg-[#f5f5f5] transition-colors"
                  >
                    <span className="max-w-[140px] truncate">Generate invoice</span>
                    <span className="bg-[#f6f6f6] group-hover:bg-white border border-[#e7e7e7] rounded-lg p-1.5 transition-colors">
                      <FileText className="w-4 h-4 text-[#454545]" />
                    </span>
                  </Link>

                  <div className="w-px h-6 bg-[#e7e7e7] self-center" />

                  <Link
                    href="/workflows"
                    className="group flex items-center gap-2 h-11 rounded-lg px-3 text-[13px] font-medium text-[#454545] hover:bg-[#f5f5f5] transition-colors relative"
                  >
                    <span className="truncate">Message</span>
                    <span className="bg-[#f6f6f6] group-hover:bg-white border border-[#e7e7e7] rounded-lg p-1.5 transition-colors">
                      <MessageSquare className="w-4 h-4 text-[#454545]" />
                    </span>
                  </Link>

                  <div className="w-px h-6 bg-[#e7e7e7] self-center" />

                  <Link
                    href="/subscription"
                    className="group flex items-center gap-2 h-11 rounded-lg px-3 text-[13px] font-medium text-[#454545] hover:bg-[#f5f5f5] transition-colors relative"
                  >
                    <span className="truncate">Notification</span>
                    <span className="bg-[#f6f6f6] group-hover:bg-white border border-[#e7e7e7] rounded-lg p-1.5 transition-colors">
                      <Bell className="w-4 h-4 text-[#454545]" />
                    </span>
                  </Link>

                  <div className="w-px h-6 bg-[#e7e7e7] self-center" />

                  <Link
                    href="/privacy-policy"
                    className="group flex items-center gap-2 h-11 rounded-lg px-3 text-[13px] font-medium text-[#454545] hover:bg-[#f5f5f5] transition-colors"
                  >
                    <span className="truncate">Support</span>
                    <span className="bg-[#f6f6f6] group-hover:bg-white border border-[#e7e7e7] rounded-lg p-1.5 transition-colors">
                      <Headphones className="w-4 h-4 text-[#454545]" />
                    </span>
                  </Link>
                </div>

                <div className="relative flex-shrink-0 flex items-center">
                  {isCompanyAdmin && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => router.push("/subscription")}
                      className="hidden sm:inline-flex whitespace-nowrap bg-gradient-to-br from-[#1da750] to-[#00a85a] hover:from-[#16c05a] hover:to-[#00d06e] text-white border border-white/10 mr-3 h-11 px-4 rounded-lg text-[13px] font-semibold shadow-sm hover:shadow-md transition-all focus-visible:ring-2 focus-visible:ring-[#1da750] focus-visible:ring-offset-2"
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Subscription
                    </Button>
                  )}

                  {isAuthenticated && user ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        className={cn(
                          "flex h-11 max-w-[min(100%,240px)] cursor-pointer items-center gap-2.5 rounded-full border border-[#e6e6e9] bg-white py-1 pl-1.5 pr-2.5",
                          "shadow-[0_1px_2px_rgba(15,15,20,0.04)] transition-[background-color,box-shadow,border-color]",
                          "hover:border-[#d8d8dc] hover:bg-[#f8f8f9] hover:shadow-[0_2px_6px_rgba(15,15,20,0.06)]",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1da750]/25 focus-visible:ring-offset-2"
                        )}
                        aria-label="Account menu"
                      >
                        <Avatar className="h-9 w-9 shrink-0 ring-2 ring-white">
                          {showLogo && (
                            <AvatarImage
                              src={companyLogo!}
                              alt={companyName || "Company"}
                              onError={handleImageError}
                            />
                          )}
                          <AvatarFallback className="bg-[#1da750] text-[11px] font-semibold text-white">
                            {showLogo ? null : avatarInitials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1 text-left">
                          <p className="truncate text-[13px] font-semibold leading-tight tracking-[-0.01em] text-[#141414]">
                            {user?.name || "Account"}
                          </p>
                          <p className="mt-0.5 truncate text-[11px] font-medium uppercase tracking-[0.06em] text-[#6b6b6e]">
                            {isCompanyAdmin ? "Admin" : "Staff"}
                          </p>
                        </div>
                        <ChevronDown className="h-4 w-4 shrink-0 text-[#8e8e93]" strokeWidth={2} aria-hidden />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>
                          <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{user?.name || "Account"}</p>
                            {user?.email && (
                              <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                            )}
                            {tenant?.name && (
                              <p className="text-xs leading-none text-muted-foreground">Company: {tenant.name}</p>
                            )}
                          </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {showTenantSwitch && (
                          <>
                            <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
                              Switch Company
                            </DropdownMenuLabel>
                            {otherMemberships.map((membership) => (
                              <DropdownMenuItem
                                key={membership.tenantId}
                                onClick={() => handleTenantSwitch(membership.tenantId)}
                                className={`cursor-pointer ${switchingTenant ? "opacity-50 pointer-events-none" : ""}`}
                              >
                                <Building2 className="h-4 w-4 mr-2" />
                                {switchingTenant ? "Switching..." : membership.tenant.name}
                              </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator />
                          </>
                        )}
                        <DropdownMenuItem asChild className="cursor-pointer">
                          <Link href="/settings/account">Account</Link>
                        </DropdownMenuItem>
                        {isCompanyAdmin && (
                          <>
                            <DropdownMenuItem asChild className="cursor-pointer">
                              <Link href="/settings/company">Company Settings</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild className="cursor-pointer">
                              <Link href="/dashboard/staff">Staff</Link>
                            </DropdownMenuItem>
                          </>
                        )}
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
                    <Button onClick={() => router.push("/")} className="px-4 py-2" type="button">
                      Login
                    </Button>
                  )}
                </div>
              </>
            }
          />

          <MainContent>{children}</MainContent>

          <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#e7e7e7] safe-area-inset-bottom">
            <div className="flex items-center justify-around px-2 py-2">
              {mobileBottomNavItems.map((item) => {
                const Icon = item.icon;
                const active = isActiveHref(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[44px] min-h-[44px] justify-center ${
                      active ? "text-[#1da750]" : "text-[#716f70]"
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${active ? "text-[#1da750]" : "text-[#716f70]"}`} />
                    <span className="text-[10px] font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          <Link
            href="/order-input"
            className="lg:hidden fixed bottom-24 right-4 z-40 w-14 h-14 bg-gradient-to-br from-[#1da750] to-[#00a85a] rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform active:scale-95"
          >
            <Plus className="w-6 h-6 text-white" />
          </Link>

          {/* Keep the old nav markup hidden to avoid breaking any existing behavior. */}
          <nav className="hidden border-b border-border bg-card">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/dashboard" className="text-xl font-bold">
                ifofy
              </Link>
              <div className="hidden md:flex gap-4">
                {navItems.map((item) => {
                  const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          
            <div className="hidden md:flex items-center gap-3">
              {isCompanyAdmin && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => router.push('/subscription')}
                  className="flex items-center gap-2 bg-orange-100/50 hover:bg-orange-200/50 text-orange-700 border border-orange-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none" strokeWidth="0" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z"></path>
                    <path d="M5 21h14"></path>
                  </svg>
                  Subscription
                </Button>
              )}
              
              {isAuthenticated && user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-2 outline-none focus:outline-none cursor-pointer">
                    <Avatar className="h-9 w-9">
                      {showLogo && (
                        <AvatarImage 
                          src={companyLogo!} 
                          alt={companyName || 'Company Logo'} 
                          onError={handleImageError}
                        />
                      )}
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                        {showLogo ? null : avatarInitials}
                      </AvatarFallback>
                    </Avatar>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user?.name || 'Account'}
                        </p>
                        {user?.email && (
                          <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                          </p>
                        )}
                        {tenant?.name && (
                          <p className="text-xs leading-none text-muted-foreground">
                            Company: {tenant.name}
                          </p>
                        )}
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {showTenantSwitch && (
                      <>
                        <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
                          Switch Company
                        </DropdownMenuLabel>
                        {otherMemberships.map((membership) => (
                          <DropdownMenuItem
                            key={membership.tenantId}
                            onClick={() => handleTenantSwitch(membership.tenantId)}
                            className={`cursor-pointer ${switchingTenant ? 'opacity-50 pointer-events-none' : ''}`}
                          >
                            <Building2 className="h-4 w-4 mr-2" />
                            {switchingTenant ? 'Switching...' : membership.tenant.name}
                          </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link href="/settings/account">
                        Account
                      </Link>
                    </DropdownMenuItem>
                    {isCompanyAdmin && (
                      <>
                        <DropdownMenuItem asChild className="cursor-pointer">
                          <Link href="/settings/company">
                            Company Settings
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="cursor-pointer">
                          <Link href="/dashboard/staff">
                            Staff
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
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
                <Button
                  onClick={() => router.push('/')}
                  className="px-4 py-2"
                >
                  Login
                </Button>
              )}
            </div>

            <div className="md:hidden flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 outline-none focus:outline-none cursor-pointer p-2">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Navigation</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {navItems.map((item) => {
                    const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                    return (
                      <DropdownMenuItem key={item.href} asChild>
                        <Link
                          href={item.href}
                          className={cn(
                            'cursor-pointer',
                            isActive && 'bg-muted'
                          )}
                        >
                          {item.label}
                        </Link>
                      </DropdownMenuItem>
                    );
                  })}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/settings/account">
                      Account Settings
                    </Link>
                  </DropdownMenuItem>
                  {isCompanyAdmin && (
                    <>
                      <DropdownMenuItem asChild className="cursor-pointer">
                        <Link href="/settings/company">
                          Company Settings
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="cursor-pointer">
                        <Link href="/dashboard/staff">
                          Staff
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-destructive focus:text-destructive"
                  >
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 outline-none focus:outline-none cursor-pointer">
                  <Avatar className="h-8 w-8">
                    {showLogo && (
                      <AvatarImage 
                        src={companyLogo!} 
                        alt={companyName || 'Company Logo'} 
                        onError={handleImageError}
                      />
                    )}
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {showLogo ? null : avatarInitials}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user?.name || 'Account'}
                      </p>
                      {user?.email && (
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      )}
                      {tenant?.name && (
                        <p className="text-xs leading-none text-muted-foreground">
                          Company: {tenant.name}
                        </p>
                      )}
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>
        </div>
      </DashboardLayout>
    </>
  );
}