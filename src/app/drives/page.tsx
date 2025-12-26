import { redirect } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { getSession, getUserProfile } from '@/actions/auth';
import { getOpenDrives } from '@/actions/placement';
import { checkEligibility, formatTierName } from '@/lib/iips/eligibility-engine';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MainNavbar } from '@/components/layout/main-navbar';
import {
  Calendar,
  MapPin,
  IndianRupee,
  Users,
  Search,
  Filter,
  Briefcase,
} from 'lucide-react';

export const metadata = {
  title: 'Placement Drives',
  description: 'Browse and apply to placement drives',
};

export default async function DrivesPage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  const profile = await getUserProfile();

  if (!profile) {
    redirect('/onboarding');
  }

  // Fetch drives - can fail gracefully
  const drives = await getOpenDrives().catch(() => []);

  // Check eligibility for each drive
  const drivesWithEligibility = drives.map((drive) => ({
    drive,
    eligibility: checkEligibility(profile, drive),
  }));

  return (
    <div className="min-h-screen bg-background">
      <MainNavbar userName={profile.fullName} programName={profile.programName} />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">Placement Drives</h2>
          <p className="text-muted-foreground">
            {drives.length} open {drives.length === 1 ? 'drive' : 'drives'} available
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search companies..." className="pl-10" />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
            <Badge variant="regular" className="cursor-pointer hover:opacity-80">
              Regular
            </Badge>
            <Badge variant="dream" className="cursor-pointer hover:opacity-80">
              Dream
            </Badge>
            <Badge variant="superDream" className="cursor-pointer hover:opacity-80">
              Super Dream
            </Badge>
          </div>
        </div>

        {drives.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No Open Drives</h3>
              <p className="text-muted-foreground">
                There are no placement drives open at the moment. Check back later!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {drivesWithEligibility.map(({ drive, eligibility }) => (
              <Card key={drive.id} className={`relative ${!eligibility.eligible ? 'opacity-75' : ''}`}>
                <div className="absolute top-4 right-4">
                  <Badge variant={drive.tier === 'superDream' ? 'superDream' : drive.tier}>
                    {formatTierName(drive.tier)}
                  </Badge>
                </div>

                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 bg-muted rounded-lg flex items-center justify-center">
                      {drive.companyLogo ? (
                        <img 
                          src={drive.companyLogo} 
                          alt={drive.companyName} 
                          className="h-8 w-8 object-contain"
                        />
                      ) : (
                        <Briefcase className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate pr-16">
                        {drive.companyName}
                      </CardTitle>
                      <CardDescription className="truncate">
                        {drive.jobTitle}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <IndianRupee className="h-4 w-4" />
                      <span>{drive.packageLPA} LPA</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span className="truncate">{drive.workLocation ?? 'TBD'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{drive.applicationDeadline ? format(new Date(drive.applicationDeadline), 'dd MMM') : 'TBD'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{drive.applicantCount ?? 0} applied</span>
                    </div>
                  </div>

                  <div className={`p-3 rounded-lg text-sm ${
                    eligibility.eligible 
                      ? 'bg-green-50 text-green-800' 
                      : 'bg-red-50 text-red-800'
                  }`}>
                    {eligibility.eligible ? (
                      eligibility.canUpgrade ? (
                        <>✨ Eligible to upgrade from {formatTierName(eligibility.currentTier!)}</>
                      ) : (
                        <>✓ You are eligible to apply</>
                      )
                    ) : (
                      <>✗ {eligibility.reason.substring(0, 60)}...</>
                    )}
                  </div>

                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>Min CGPA: {drive.eligibility?.minCGPA ?? 'N/A'}</p>
                    <p>Programs: {drive.eligibility?.allowedPrograms?.slice(0, 3).join(', ') || 'All'}</p>
                  </div>

                  {/* Action Button */}
                  <Link href={`/drives/${drive.id}`} className="block">
                    <Button 
                      className="w-full" 
                      variant={eligibility.eligible ? 'default' : 'secondary'}
                    >
                      {eligibility.eligible ? 'View & Apply' : 'View Details'}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
