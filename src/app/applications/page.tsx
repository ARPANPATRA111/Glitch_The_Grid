import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession, getUserProfile } from '@/actions/auth';
import { getMyApplications } from '@/actions/placement';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MainNavbar } from '@/components/layout/main-navbar';
import {
  Briefcase,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Building2,
  IndianRupee,
} from 'lucide-react';

export const metadata = {
  title: 'My Applications',
  description: 'Track your placement applications',
};

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  applied: { label: 'Applied', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', icon: <Clock className="h-3 w-3" /> },
  shortlisted: { label: 'Shortlisted', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', icon: <AlertCircle className="h-3 w-3" /> },
  'round-1': { label: 'Round 1', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400', icon: <Calendar className="h-3 w-3" /> },
  'round-2': { label: 'Round 2', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400', icon: <Calendar className="h-3 w-3" /> },
  'round-3': { label: 'Round 3', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400', icon: <Calendar className="h-3 w-3" /> },
  selected: { label: 'Selected', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', icon: <CheckCircle className="h-3 w-3" /> },
  rejected: { label: 'Not Selected', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', icon: <XCircle className="h-3 w-3" /> },
  withdrawn: { label: 'Withdrawn', color: 'bg-muted text-muted-foreground', icon: <XCircle className="h-3 w-3" /> },
};

export default async function ApplicationsPage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  const profile = await getUserProfile();

  if (!profile) {
    redirect('/onboarding');
  }

  const applications = await getMyApplications().catch(() => []);

  return (
    <div className="min-h-screen bg-background">
      <MainNavbar userName={profile.fullName} programName={profile.programName} />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold">My Applications</h2>
            <p className="text-muted-foreground">{applications.length} total applications</p>
          </div>
          <Link href="/drives">
            <Button>Browse Drives</Button>
          </Link>
        </div>

        {applications.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Applications Yet</h3>
              <p className="text-muted-foreground mb-4">
                You haven&apos;t applied to any placement drives yet.
              </p>
              <Link href="/drives">
                <Button>Browse Available Drives</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {applications.map((application) => {
              const status = statusConfig[application.status] ?? statusConfig.applied!;
              
              return (
                <Card key={application.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Building2 className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{application.companyName}</CardTitle>
                          <CardDescription className="capitalize">{application.tier} tier - ₹{application.packageLPA} LPA</CardDescription>
                        </div>
                      </div>
                      <Badge className={`${status?.color ?? 'bg-blue-100 text-blue-800'} flex items-center gap-1`}>
                        {status?.icon}
                        {status?.label ?? application.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <IndianRupee className="h-4 w-4" />
                        <span>₹{application.packageLPA} LPA</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Applied: {application.appliedAt instanceof Date 
                          ? application.appliedAt.toLocaleDateString() 
                          : new Date(application.appliedAt).toLocaleDateString()}</span>
                      </div>
                      {application.currentRound && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>Current: {application.currentRound}</span>
                        </div>
                      )}
                    </div>

                    {application.status !== 'withdrawn' && application.status !== 'rejected' && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary rounded-full transition-all"
                              style={{ 
                                width: application.status === 'selected' ? '100%' 
                                  : application.status === 'round-3' ? '80%'
                                  : application.status === 'round-2' ? '60%'
                                  : application.status === 'round-1' ? '45%'
                                  : application.status === 'shortlisted' ? '30%'
                                  : '15%'
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mt-4 flex gap-2">
                      <Link href={`/drives/${application.driveId}`}>
                        <Button variant="outline" size="sm">View Drive</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
