'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { logout } from '@/actions/auth';
import type { Route } from 'next';
import {
  GraduationCap,
  LogOut,
  Settings,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  adminOnly?: boolean;
}

const studentNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Drives', href: '/drives' },
  { label: 'My Applications', href: '/applications' },
  { label: 'Profile', href: '/profile' },
];

const adminNavItems: NavItem[] = [
  { label: 'Overview', href: '/admin' },
];

interface MainNavbarProps {
  userName?: string;
  userRole?: 'student' | 'tpo' | 'admin';
  programName?: string;
}

export function MainNavbar({ userName, userRole, programName }: MainNavbarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const isAdmin = userRole === 'admin' || userRole === 'tpo';
  const isAdminRoute = pathname.startsWith('/admin');
  
  const navItems = isAdminRoute ? adminNavItems : studentNavItems;

  const isActiveLink = (href: string) => {
    if (href === '/admin' && pathname === '/admin') return true;
    if (href === '/dashboard' && pathname === '/dashboard') return true;
    if (href !== '/admin' && href !== '/dashboard') {
      return pathname.startsWith(href);
    }
    return false;
  };

  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="h-16 flex items-center justify-between">
          <Link href={isAdminRoute ? '/admin' : '/dashboard'} className="flex items-center gap-3 flex-shrink-0">
            <GraduationCap className="h-8 w-8 text-primary" />
            <div className="hidden sm:block">
              <h1 className="font-bold text-lg leading-tight">IIPS Placement Portal</h1>
              {programName && !isAdminRoute && (
                <p className="text-xs text-muted-foreground">{programName}</p>
              )}
              {isAdminRoute && (
                <p className="text-xs text-muted-foreground">Admin Panel</p>
              )}
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href as Route}
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  isActiveLink(item.href)
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-gray-100"
                )}
              >
                {item.label}
              </Link>
            ))}
            
            {isAdmin && !isAdminRoute && (
              <Link
                href="/admin"
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-md transition-colors ml-2",
                  "text-orange-600 hover:text-orange-700 hover:bg-orange-50 flex items-center gap-1"
                )}
              >
                <Settings className="h-4 w-4" />
                Admin Panel
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-4">
            {userName && (
              <span className="text-sm text-muted-foreground hidden lg:inline">
                {userName}
              </span>
            )}
            <form action={logout}>
              <Button variant="ghost" size="sm" type="submit" title="Logout">
                <LogOut className="h-4 w-4" />
                <span className="ml-2 hidden sm:inline">Logout</span>
              </Button>
            </form>
            
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        <div className="h-10 flex items-center border-t -mx-4 px-4 bg-gray-50/50">
          <Breadcrumb />
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t py-4">
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href as Route}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActiveLink(item.href)
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-gray-100"
                  )}
                >
                  {item.label}
                </Link>
              ))}
              
              {isAdmin && !isAdminRoute && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 text-sm font-medium rounded-md text-orange-600 hover:bg-orange-50 flex items-center gap-1"
                >
                  <Settings className="h-4 w-4" />
                  Admin Panel
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

export default MainNavbar;
