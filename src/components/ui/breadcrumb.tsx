'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Route } from 'next';

interface BreadcrumbItem {
  label: string;
  href: string;
}

const routeLabels: Record<string, string> = {
  '': 'Home',
  'dashboard': 'Dashboard',
  'drives': 'Placement Drives',
  'applications': 'My Applications',
  'profile': 'Profile',
  'admin': 'Admin',
  'students': 'Students',
  'companies': 'Companies',
  'analytics': 'Analytics',
  'settings': 'Settings',
  'new': 'Create New',
  'edit': 'Edit',
  'onboarding': 'Complete Profile',
  'login': 'Login',
  'register': 'Register',
};

function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean);
  
  if (segments.length === 0) {
    return [];
  }

  const breadcrumbs: BreadcrumbItem[] = [];
  let currentPath = '';

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i]!;
    currentPath += `/${segment}`;
    
    const isId = /^[a-zA-Z0-9]{20,}$/.test(segment);
    
    let label: string;
    if (isId) {
      const prevSegment = segments[i - 1];
      if (prevSegment === 'students') {
        label = 'Student Details';
      } else if (prevSegment === 'drives') {
        label = 'Drive Details';
      } else if (prevSegment === 'companies') {
        label = 'Company Details';
      } else {
        label = 'Details';
      }
    } else {
      label = routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
    }

    breadcrumbs.push({
      label,
      href: currentPath,
    });
  }

  return breadcrumbs;
}

interface BreadcrumbProps {
  className?: string;
}

export function Breadcrumb({ className }: BreadcrumbProps) {
  const pathname = usePathname();
  const breadcrumbs = generateBreadcrumbs(pathname);

  if (breadcrumbs.length === 0) {
    return null;
  }

  return (
    <nav 
      aria-label="Breadcrumb" 
      className={cn("flex items-center text-sm text-muted-foreground", className)}
    >
      <ol className="flex items-center gap-1">
        <li>
          <Link 
            href="/dashboard" 
            className="hover:text-foreground transition-colors flex items-center gap-1"
          >
            <Home className="h-3.5 w-3.5" />
            <span className="sr-only">Home</span>
          </Link>
        </li>
        
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          
          return (
            <li key={crumb.href} className="flex items-center gap-1">
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
              {isLast ? (
                <span className="font-medium text-foreground">
                  {crumb.label}
                </span>
              ) : (
                <Link 
                  href={crumb.href as Route}
                  className="hover:text-foreground transition-colors"
                >
                  {crumb.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Breadcrumb;
