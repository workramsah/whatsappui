'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

type User = { 
  id: string; 
  email: string; 
  name?: string; 
  isSuperAdmin?: boolean;
  role?: string; // Current tenant role
  globalRole?: string;
};
type Tenant = { id: string; name?: string };

type AuthContextValue = {
  user: User | null;
  tenant: Tenant | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  isCompanyAdmin: boolean;
  refreshUser: () => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const tokenRef = useRef<string | null>(null);

  const refreshUser = useCallback(async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    tokenRef.current = token;
    if (!token) {
      setUser(null);
      setTenant(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        throw new Error('Unauthorized');
      }
      const data = await res.json();
      const user = data.user;
      // Add role information from memberships
      if (data.memberships && data.memberships.length > 0) {
        // Get the role for the current active tenant
        const currentMembership = data.memberships.find((m: any) => m.tenantId === data.tenant?.id);
        if (currentMembership) {
          user.role = currentMembership.role;
        }
      }
      // Set globalRole based on isSuperAdmin
      user.globalRole = user.isSuperAdmin ? 'SUPER_ADMIN' : 'USER';
      setUser(user || null);
      setTenant(data.tenant || null);
    } catch {
      localStorage.removeItem('token');
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      setUser(null);
      setTenant(null);
      tokenRef.current = null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    // Clear cookie as well
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    setUser(null);
    setTenant(null);
    // Dispatch auth change event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('authChange'));
    }
  }, []);

  useEffect(() => {
    refreshUser();
    
    // Listen for storage changes (when token is removed manually)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token' && !e.newValue) {
        // Token was removed
        setUser(null);
        setTenant(null);
        tokenRef.current = null;
        // Redirect to login if on protected route
        if (typeof window !== 'undefined' && window.location.pathname !== '/') {
          window.location.href = '/';
        }
      } else if (e.key === 'token' && e.newValue) {
        // Token was added/changed
        refreshUser();
      }
    };
    
    // Listen for auth change events
    const handleAuthChange = () => {
      refreshUser();
    };
    
    // Check auth status when window gets focus (detects cookie deletions)
    const handleFocus = () => {
      const currentToken = localStorage.getItem('token');
      if (!currentToken && user) {
        // Token was deleted while window was not focused
        setUser(null);
        setTenant(null);
        tokenRef.current = null;
      }
    };
    
    // Periodic check for token validity (every 60 seconds to reduce re-renders)
    const intervalId = setInterval(() => {
      const currentToken = localStorage.getItem('token');
      if (!currentToken && user) {
        setUser(null);
        setTenant(null);
        tokenRef.current = null;
      }
    }, 60000);
    
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
      window.addEventListener('authChange', handleAuthChange);
      window.addEventListener('focus', handleFocus);
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('authChange', handleAuthChange);
        window.removeEventListener('focus', handleFocus);
      }
      clearInterval(intervalId);
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      tenant,
      isLoading,
      isAuthenticated: !!user,
      isSuperAdmin: !!user?.isSuperAdmin,
      isCompanyAdmin: !!user && (user.isSuperAdmin || user.role !== 'STAFF'),
      refreshUser,
      logout,
    }),
    [user, tenant, isLoading, refreshUser, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return ctx;
}
