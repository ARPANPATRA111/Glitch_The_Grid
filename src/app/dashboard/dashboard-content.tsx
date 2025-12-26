'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MainNavbar } from '@/components/layout/main-navbar';
import type { UserProfile, PlacementDrive, Application } from '@/types/schema';
import { formatTierName, getAvailableTiers } from '@/lib/iips/eligibility-engine';
import { 
  Briefcase, 
  FileText, 
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
} from 'lucide-react';

interface DashboardContentProps {
  profile: UserProfile;
  drives: PlacementDrive[];
  applications: Application[];
  isAdmin?: boolean;
}

export function DashboardContent({ profile, drives, applications, isAdmin }: DashboardContentProps) {
  const availableTiers = getAvailableTiers(profile.placementStatus);
  
  // Calculate stats
  const appliedCount = applications.length;
  const shortlistedCount = applications.filter(a => 
    ['shortlisted', 'round-1', 'round-2', 'round-3'].includes(a.status)
  ).length;
  const selectedCount = applications.filter(a => a.status === 'selected').length;

  // Get recent applications
  const recentApplications = applications.slice(0, 5);

  // Get upcoming drives
  const upcomingDrives = drives.filter(d => d.status === 'open').slice(0, 5);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <MainNavbar 
        userName={profile.fullName}
        userRole={isAdmin ? 'admin' : 'student'}
        programName={profile.programName}
      />

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">Welcome back, {profile.fullName.split(' ')[0]}!</h2>
          <p className="text-muted-foreground">
            {profile.rollNumber} • {profile.programName} • Batch {profile.batch}
          </p>
        </div>

        {/* Placement Status Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Your Placement Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 items-center">
              {profile.placementStatus.isPlaced ? (
                <>
                  <Badge 
                    variant={profile.placementStatus.currentTier ?? 'regular'}
                    className="text-base px-4 py-1"
                  >
                    {formatTierName(profile.placementStatus.currentTier!)} Offer Holder
                  </Badge>
                  <span className="text-muted-foreground">
                    You can apply for: {availableTiers.map(t => formatTierName(t)).join(', ') || 'None'}
                  </span>
                </>
              ) : profile.placementStatus.isDebarred ? (
                <Badge variant="destructive" className="text-base px-4 py-1">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  Debarred
                </Badge>
              ) : (
                <>
                  <Badge variant="secondary" className="text-base px-4 py-1">
                    Unplaced
                  </Badge>
                  <span className="text-muted-foreground">
                    You are eligible for all placement tiers
                  </span>
                </>
              )}
            </div>

            {profile.placementStatus.offers.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <h4 className="font-medium mb-2">Your Offers</h4>
                <div className="space-y-2">
                  {profile.placementStatus.offers.map((offer, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div>
                        <p className="font-medium">{offer.companyName}</p>
                        <p className="text-sm text-muted-foreground">{offer.packageLPA} LPA</p>
                      </div>
                      <Badge variant={offer.tier}>{formatTierName(offer.tier)}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{appliedCount}</p>
                  <p className="text-sm text-muted-foreground">Applied</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{shortlistedCount}</p>
                  <p className="text-sm text-muted-foreground">In Process</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{selectedCount}</p>
                  <p className="text-sm text-muted-foreground">Selected</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Briefcase className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{upcomingDrives.length}</p>
                  <p className="text-sm text-muted-foreground">Open Drives</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Upcoming Drives */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Open Drives
                </span>
                <Link href="/drives">
                  <Button variant="ghost" size="sm">View All</Button>
                </Link>
              </CardTitle>
              <CardDescription>Drives you can apply to</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingDrives.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No open drives at the moment
                </p>
              ) : (
                <div className="space-y-4">
                  {upcomingDrives.map((drive) => (
                    <div 
                      key={drive.id} 
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{drive.companyName}</h4>
                          <Badge variant={drive.tier} className="text-xs">
                            {formatTierName(drive.tier)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{drive.jobTitle}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span>{drive.packageLPA} LPA</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(drive.applicationDeadline), 'dd MMM')}
                          </span>
                        </div>
                      </div>
                      <Link href={`/drives/${drive.id}`}>
                        <Button size="sm">View</Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Applications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Recent Applications
                </span>
                <Link href="/applications">
                  <Button variant="ghost" size="sm">View All</Button>
                </Link>
              </CardTitle>
              <CardDescription>Track your application status</CardDescription>
            </CardHeader>
            <CardContent>
              {recentApplications.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  You haven&apos;t applied to any drives yet
                </p>
              ) : (
                <div className="space-y-4">
                  {recentApplications.map((app) => (
                    <div 
                      key={app.id} 
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <h4 className="font-medium">{app.companyName}</h4>
                        <p className="text-sm text-muted-foreground">
                          Applied {format(new Date(app.appliedAt), 'dd MMM yyyy')}
                        </p>
                      </div>
                      <Badge 
                        variant={
                          app.status === 'selected' ? 'success' :
                          app.status === 'rejected' ? 'destructive' :
                          app.status === 'withdrawn' ? 'outline' :
                          'secondary'
                        }
                      >
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Profile Completion Alert */}
        {!profile.resumeUrl && (
          <Card className="mt-8 border-yellow-200 bg-yellow-50">
            <CardContent className="py-4">
              <div className="flex items-center gap-4">
                <AlertCircle className="h-6 w-6 text-yellow-600" />
                <div className="flex-1">
                  <h4 className="font-medium text-yellow-800">Upload Your Resume</h4>
                  <p className="text-sm text-yellow-700">
                    You need to upload your resume before applying to placement drives.
                  </p>
                </div>
                <Link href="/profile">
                  <Button variant="outline" size="sm">
                    Upload Now
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
