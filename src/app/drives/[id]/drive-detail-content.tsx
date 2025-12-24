'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { applyToDrive, withdrawApplication } from '@/actions/placement';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import type { PlacementDrive } from '@/types/schema';
import type { EligibilityCheckResult } from '@/lib/iips/eligibility-engine';
import { formatTierName } from '@/lib/iips/eligibility-engine';
import {
  GraduationCap,
  ArrowLeft,
  Calendar,
  MapPin,
  IndianRupee,
  Users,
  Building2,
  Globe,
  FileText,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertTriangle,
} from 'lucide-react';

interface DriveDetailContentProps {
  drive: PlacementDrive;
  eligibility: EligibilityCheckResult;
  hasApplied: boolean;
  hasResume: boolean;
}

export function DriveDetailContent({ 
  drive, 
  eligibility, 
  hasApplied,
  hasResume 
}: DriveDetailContentProps) {
  const [isApplying, setIsApplying] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [applied, setApplied] = useState(hasApplied);
  const router = useRouter();
  const { toast } = useToast();

  const handleApply = async () => {
    if (!hasResume) {
      toast({
        title: 'Resume Required',
        description: 'Please upload your resume before applying.',
        variant: 'destructive',
      });
      router.push('/profile');
      return;
    }

    setIsApplying(true);
    try {
      const result = await applyToDrive(drive.id);
      
      if (result.success) {
        setApplied(true);
        toast({
          title: 'Application Submitted!',
          description: `You have successfully applied to ${drive.companyName}.`,
          variant: 'default',
        });
        router.refresh();
      } else {
        toast({
          title: 'Application Failed',
          description: result.error,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Apply error:', error);
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsApplying(false);
    }
  };

  const handleWithdraw = async () => {
    setIsWithdrawing(true);
    try {
      const result = await withdrawApplication(drive.id);
      
      if (result.success) {
        setApplied(false);
        toast({
          title: 'Application Withdrawn',
          description: 'Your application has been withdrawn.',
          variant: 'default',
        });
        router.refresh();
      } else {
        toast({
          title: 'Withdrawal Failed',
          description: result.error,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/drives">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <GraduationCap className="h-8 w-8 text-primary" />
            <h1 className="font-bold text-lg">IIPS Placement Portal</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Company Header */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="h-20 w-20 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  {drive.companyLogo ? (
                    <img 
                      src={drive.companyLogo} 
                      alt={drive.companyName} 
                      className="h-14 w-14 object-contain"
                    />
                  ) : (
                    <Building2 className="h-10 w-10 text-gray-400" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <h1 className="text-2xl font-bold">{drive.companyName}</h1>
                      <p className="text-lg text-muted-foreground">{drive.jobTitle}</p>
                    </div>
                    <Badge variant={drive.tier === 'superDream' ? 'superDream' : drive.tier} className="text-sm px-3 py-1">
                      {formatTierName(drive.tier)}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-4">
                    <span className="flex items-center gap-1">
                      <IndianRupee className="h-4 w-4" />
                      {drive.packageLPA} LPA
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {drive.workLocation ?? 'TBD'}
                      {drive.isRemote && ' (Remote)'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Deadline: {drive.applicationDeadline 
                        ? format(new Date(drive.applicationDeadline), 'dd MMM yyyy')
                        : 'TBD'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {drive.applicantCount ?? 0} applied
                    </span>
                    {drive.website && (
                      <a 
                        href={drive.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-primary hover:underline"
                      >
                        <Globe className="h-4 w-4" />
                        Website
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="md:col-span-2 space-y-6">
              {/* Job Description */}
              <Card>
                <CardHeader>
                  <CardTitle>Job Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{drive.jobDescription ?? 'No description available.'}</p>
                </CardContent>
              </Card>

              {/* Selection Process */}
              {(drive.rounds ?? []).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Selection Process</CardTitle>
                    <CardDescription>{drive.rounds.length} rounds</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {drive.rounds.map((round, index) => (
                        <div key={round.id ?? index} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                              {index + 1}
                            </div>
                            {index < drive.rounds.length - 1 && (
                              <div className="w-0.5 flex-1 bg-gray-200 my-1" />
                            )}
                          </div>
                          <div className="flex-1 pb-4">
                            <h4 className="font-medium">{round.name}</h4>
                            <Badge variant="outline" className="text-xs mt-1">
                              {round.type}
                            </Badge>
                            {round.description && (
                              <p className="text-sm text-muted-foreground mt-2">
                                {round.description}
                              </p>
                            )}
                            {round.duration && (
                              <p className="text-sm text-muted-foreground mt-1">
                                Duration: {round.duration} minutes
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Documents */}
              {(drive.documents ?? []).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Documents</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {drive.documents.map((doc) => (
                        <a
                          key={doc.id}
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <FileText className="h-5 w-5 text-primary" />
                          <span>{doc.name}</span>
                          <Badge variant="outline" className="ml-auto">
                            {doc.type.toUpperCase()}
                          </Badge>
                        </a>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Apply Card */}
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Apply to This Drive</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Application Status - Show when applied */}
                  {applied ? (
                    <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-blue-800">Application Submitted</h4>
                          <p className="text-sm text-blue-700 mt-1">
                            You have successfully applied to this drive. Check your applications page for updates.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Eligibility Status - Show when not applied */
                    <div className={`p-4 rounded-lg ${
                      eligibility.eligible 
                        ? 'bg-green-50 border border-green-200' 
                        : 'bg-red-50 border border-red-200'
                    }`}>
                      <div className="flex items-start gap-3">
                        {eligibility.eligible ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                        )}
                        <div>
                          <h4 className={`font-medium ${
                            eligibility.eligible ? 'text-green-800' : 'text-red-800'
                          }`}>
                            {eligibility.eligible ? 'You are eligible!' : 'Not Eligible'}
                          </h4>
                          <p className={`text-sm mt-1 ${
                            eligibility.eligible ? 'text-green-700' : 'text-red-700'
                          }`}>
                            {eligibility.reason}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Resume Warning - Only show when not applied and eligible */}
                  {!applied && !hasResume && eligibility.eligible && (
                    <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-yellow-800">Resume Required</h4>
                          <p className="text-sm text-yellow-700 mt-1">
                            Please upload your resume before applying.
                          </p>
                          <Link href="/profile">
                            <Button variant="outline" size="sm" className="mt-2">
                              Upload Resume
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  {applied ? (
                    <div className="space-y-3">
                      <Button disabled className="w-full" variant="secondary">
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Applied
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full text-red-600 hover:text-red-700"
                        onClick={handleWithdraw}
                        disabled={isWithdrawing}
                      >
                        {isWithdrawing ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : null}
                        Withdraw Application
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      className="w-full" 
                      disabled={!eligibility.eligible || isApplying}
                      onClick={handleApply}
                    >
                      {isApplying ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : null}
                      {isApplying ? 'Applying...' : 'Apply Now'}
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Eligibility Criteria */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Eligibility Criteria</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Min CGPA</span>
                    <span className="font-medium">{drive.eligibility?.minCGPA ?? 'N/A'}</span>
                  </div>
                  {drive.eligibility?.maxBacklogs !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Max Backlogs</span>
                      <span className="font-medium">{drive.eligibility.maxBacklogs}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Programs</span>
                    <span className="font-medium text-right">
                      {(drive.eligibility?.allowedPrograms ?? []).length > 0 
                        ? (drive.eligibility?.allowedPrograms ?? []).slice(0, 3).join(', ')
                        : 'All'}
                    </span>
                  </div>
                  {drive.eligibility?.customCriteria && (
                    <div className="pt-2 border-t">
                      <p className="text-muted-foreground">{drive.eligibility.customCriteria}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
