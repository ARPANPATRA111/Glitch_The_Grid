'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MainNavbar } from '@/components/layout/main-navbar';
import type { AdminStats, RecentActivity } from '@/actions/admin';
import { 
  Users, 
  Briefcase, 
  FileText, 
  PlusCircle,
  BarChart3,
  UserCog,
  Building2,
  Clock,
} from 'lucide-react';

interface AdminDashboardProps {
  userRole: 'admin' | 'tpo';
  stats: AdminStats;
  recentActivity?: RecentActivity[];
}

export function AdminDashboard({ userRole, stats, recentActivity = [] }: AdminDashboardProps) {
  const adminLinks = [
    {
      title: 'Manage Drives',
      description: 'Create, edit, and manage placement drives',
      icon: Briefcase,
      href: '/admin/drives',
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/30',
    },
    {
      title: 'Create New Drive',
      description: 'Add a new placement drive',
      icon: PlusCircle,
      href: '/admin/drives/new',
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/30',
    },
    {
      title: 'Manage Students',
      description: 'View and manage student profiles',
      icon: Users,
      href: '/admin/students',
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900/30',
    },
    {
      title: 'Applications',
      description: 'Review and process applications',
      icon: FileText,
      href: '/admin/applications',
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-900/30',
    },
    {
      title: 'Companies',
      description: 'Manage company profiles',
      icon: Building2,
      href: '/admin/companies',
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/30',
    },
    {
      title: 'Analytics',
      description: 'View placement statistics and reports',
      icon: BarChart3,
      href: '/admin/analytics',
      color: 'text-pink-600 dark:text-pink-400',
      bgColor: 'bg-pink-50 dark:bg-pink-900/30',
    },
  ];

  // Add user management for full admins only
  if (userRole === 'admin') {
    adminLinks.push({
      title: 'User Management',
      description: 'Manage admin and TPO accounts',
      icon: UserCog,
      href: '/admin/users',
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-900/30',
    });
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <MainNavbar userRole={userRole} />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold">Admin Dashboard</h2>
          <p className="text-muted-foreground mt-1">
            Manage placement drives, students, and applications
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                  <Briefcase className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.activeDrives}</p>
                  <p className="text-sm text-muted-foreground">Active Drives</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                  <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalStudents}</p>
                  <p className="text-sm text-muted-foreground">Total Students</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-50 dark:bg-orange-900/30 rounded-lg">
                  <FileText className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.pendingApplications}</p>
                  <p className="text-sm text-muted-foreground">Pending Applications</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-50 dark:bg-green-900/30 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.placements}</p>
                  <p className="text-sm text-muted-foreground">Placements</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminLinks.map((link) => (
            <Link key={link.href} href={link.href as Route}>
              <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <div className={`w-12 h-12 ${link.bgColor} rounded-lg flex items-center justify-center mb-2`}>
                    <link.icon className={`h-6 w-6 ${link.color}`} />
                  </div>
                  <CardTitle className="text-lg">{link.title}</CardTitle>
                  <CardDescription>{link.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest actions and updates</CardDescription>
            </CardHeader>
            <CardContent>
              {recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-4 p-3 bg-muted/50 rounded-lg">
                      <div className={`p-2 rounded-lg ${
                        activity.type === 'application' ? 'bg-orange-50 dark:bg-orange-900/30' :
                        activity.type === 'drive' ? 'bg-blue-50 dark:bg-blue-900/30' : 'bg-green-50 dark:bg-green-900/30'
                      }`}>
                        {activity.type === 'application' ? (
                          <FileText className={`h-4 w-4 ${
                            activity.type === 'application' ? 'text-orange-600 dark:text-orange-400' : 'text-blue-600 dark:text-blue-400'
                          }`} />
                        ) : (
                          <Briefcase className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{activity.title}</p>
                        <p className="text-sm text-muted-foreground truncate">{activity.description}</p>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(activity.timestamp).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No recent activity yet
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
