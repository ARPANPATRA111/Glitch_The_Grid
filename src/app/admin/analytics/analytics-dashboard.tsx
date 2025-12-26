'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  ArrowLeft,
  Users,
  Briefcase,
  FileCheck,
  Building2,
  TrendingUp,
  CheckCircle2,
  BarChart3,
  PieChart
} from 'lucide-react';

interface AnalyticsOverview {
  totalStudents: number;
  placedStudents: number;
  placementRate: string;
  activeDrives: number;
  completedDrives: number;
  totalDrives: number;
  totalApplications: number;
  pendingApplications: number;
  selectedApplications: number;
  avgPackage: string;
  highestPackage: string;
}

interface ProgramStat {
  code: string;
  program: string;
  total: number;
  placed: number;
  rate: string;
}

interface TierStat {
  tier: string;
  drives: number;
  applications: number;
  selected: number;
}

interface AnalyticsData {
  overview: AnalyticsOverview;
  programStats: ProgramStat[];
  tierStats: TierStat[];
}

interface AnalyticsDashboardProps {
  analytics?: AnalyticsData;
}

export function AnalyticsDashboard({ analytics }: AnalyticsDashboardProps) {
  const overview = analytics?.overview || {
    totalStudents: 0,
    placedStudents: 0,
    placementRate: '0%',
    activeDrives: 0,
    completedDrives: 0,
    totalDrives: 0,
    totalApplications: 0,
    pendingApplications: 0,
    selectedApplications: 0,
    avgPackage: '0 LPA',
    highestPackage: '0 LPA',
  };
  
  const programStats = analytics?.programStats || [];
  const tierStats = analytics?.tierStats || [];

  const unplacedStudents = overview.totalStudents - overview.placedStudents;
  const placementPercentage = overview.totalStudents > 0 
    ? Math.round((overview.placedStudents / overview.totalStudents) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Placement Analytics</h1>
            <p className="text-muted-foreground">Overview of placement statistics</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Students</p>
                  <p className="text-3xl font-bold">{overview.totalStudents}</p>
                </div>
                <Users className="h-10 w-10 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Placed Students</p>
                  <p className="text-3xl font-bold text-green-600">{overview.placedStudents}</p>
                </div>
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Drives</p>
                  <p className="text-3xl font-bold">{overview.activeDrives}</p>
                </div>
                <Briefcase className="h-10 w-10 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Placement Rate</p>
                  <p className="text-3xl font-bold">{overview.placementRate}</p>
                </div>
                <TrendingUp className="h-10 w-10 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Placement Progress
              </CardTitle>
              <CardDescription>Current placement status overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-center">
                  <div className="relative">
                    <svg className="w-48 h-48">
                      <circle
                        className="text-gray-200"
                        strokeWidth="12"
                        stroke="currentColor"
                        fill="transparent"
                        r="80"
                        cx="96"
                        cy="96"
                      />
                      <circle
                        className="text-green-600"
                        strokeWidth="12"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        r="80"
                        cx="96"
                        cy="96"
                        strokeDasharray={`${placementPercentage * 5.03} 503`}
                        transform="rotate(-90 96 96)"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-bold">{placementPercentage}%</span>
                      <span className="text-sm text-muted-foreground">Placed</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-green-600">{overview.placedStudents}</p>
                    <p className="text-sm text-muted-foreground">Placed</p>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-yellow-600">{unplacedStudents}</p>
                    <p className="text-sm text-muted-foreground">Unplaced</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Package Statistics
              </CardTitle>
              <CardDescription>Salary package insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="p-6 bg-gradient-to-r from-green-500 to-green-600 rounded-lg text-white">
                  <p className="text-sm opacity-90">Highest Package</p>
                  <p className="text-4xl font-bold">{overview.highestPackage}</p>
                </div>
                <div className="p-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg text-white">
                  <p className="text-sm opacity-90">Average Package</p>
                  <p className="text-4xl font-bold">{overview.avgPackage}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {programStats.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Program-wise Placement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {programStats.map((stat) => (
                  <div key={stat.code} className="p-4 bg-muted/50 rounded-lg">
                    <p className="font-medium">{stat.program}</p>
                    <p className="text-sm text-muted-foreground">{stat.code}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-lg font-bold">{stat.placed}/{stat.total}</span>
                      <span className="text-sm text-green-600 dark:text-green-400 font-medium">{stat.rate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Drives Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-muted-foreground">Total Drives</span>
                  <span className="font-bold">{overview.totalDrives}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-muted-foreground">Active Drives</span>
                  <span className="font-bold text-green-600">{overview.activeDrives}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-muted-foreground">Completed Drives</span>
                  <span className="font-bold">{overview.completedDrives}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileCheck className="h-5 w-5" />
                Applications Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-muted-foreground">Total Applications</span>
                  <span className="font-bold">{overview.totalApplications}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-muted-foreground">Pending Review</span>
                  <span className="font-bold text-yellow-600">{overview.pendingApplications}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-muted-foreground">Selected</span>
                  <span className="font-bold text-green-600">{overview.selectedApplications}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Tier-wise Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tierStats.map((tier) => (
                  <div key={tier.tier} className="flex items-center justify-between py-2 border-b last:border-0">
                    <span className="text-muted-foreground capitalize">{tier.tier.replace('_', ' ')}</span>
                    <span className="font-bold">{tier.drives} drives</span>
                  </div>
                ))}
                {tierStats.length === 0 && (
                  <p className="text-sm text-muted-foreground">No tier data available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
