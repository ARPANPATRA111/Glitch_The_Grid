'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { createDrive } from '@/actions/admin';
import type { PlacementTier, DriveStatus } from '@/types/schema';

const PROGRAMS = [
  { code: 'MCA_INT', name: 'MCA (Integrated)' },
  { code: 'MCA', name: 'MCA' },
  { code: 'MBA', name: 'MBA' },
  { code: 'BTECH_CS', name: 'B.Tech (CS)' },
  { code: 'BTECH_IT', name: 'B.Tech (IT)' },
  { code: 'BCA', name: 'BCA' },
  { code: 'BBA', name: 'BBA' },
];

const INDUSTRIES = [
  'Information Technology',
  'Finance & Banking',
  'Consulting',
  'E-Commerce',
  'Healthcare',
  'Manufacturing',
  'Education',
  'Telecommunications',
  'Media & Entertainment',
  'Other',
];

export function CreateDriveForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    companyLogo: '',
    industry: '',
    website: '',
    jobTitle: '',
    jobDescription: '',
    jobType: 'full-time' as 'full-time' | 'internship' | 'ppo',
    workLocation: '',
    isRemote: false,
    tier: 'regular' as PlacementTier,
    packageLPA: '',
    stipendPerMonth: '',
    minCGPA: '6.0',
    maxBacklogs: '0',
    allowedPrograms: [] as string[],
    minTenthPercent: '',
    minTwelfthPercent: '',
    applicationDeadline: '',
    driveDate: '',
    status: 'draft' as DriveStatus,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await createDrive({
        companyName: formData.companyName,
        companyLogo: formData.companyLogo || undefined,
        industry: formData.industry,
        website: formData.website || undefined,
        jobTitle: formData.jobTitle,
        jobDescription: formData.jobDescription,
        jobType: formData.jobType,
        workLocation: formData.workLocation,
        isRemote: formData.isRemote,
        tier: formData.tier,
        packageLPA: parseFloat(formData.packageLPA),
        stipendPerMonth: formData.stipendPerMonth ? parseInt(formData.stipendPerMonth) : undefined,
        eligibility: {
          minCGPA: parseFloat(formData.minCGPA),
          maxBacklogs: parseInt(formData.maxBacklogs),
          allowedPrograms: formData.allowedPrograms,
          minTenthPercent: formData.minTenthPercent ? parseFloat(formData.minTenthPercent) : undefined,
          minTwelfthPercent: formData.minTwelfthPercent ? parseFloat(formData.minTwelfthPercent) : undefined,
        },
        applicationDeadline: formData.applicationDeadline,
        driveDate: formData.driveDate || undefined,
        status: formData.status,
      });

      if (result.success) {
        toast({
          title: 'Drive created!',
          description: 'The placement drive has been created successfully.',
        });
        router.push('/admin/drives');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create drive',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleProgram = (code: string) => {
    setFormData(prev => ({
      ...prev,
      allowedPrograms: prev.allowedPrograms.includes(code)
        ? prev.allowedPrograms.filter(p => p !== code)
        : [...prev.allowedPrograms, code],
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin/drives">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Create New Drive</h1>
            <p className="text-muted-foreground">Add a new placement drive</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Company Details</CardTitle>
              <CardDescription>Information about the hiring company</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry *</Label>
                  <Select
                    value={formData.industry}
                    onValueChange={(value) => setFormData({ ...formData, industry: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDUSTRIES.map((industry) => (
                        <SelectItem key={industry} value={industry}>
                          {industry}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyLogo">Company Logo URL</Label>
                  <Input
                    id="companyLogo"
                    type="url"
                    placeholder="https://..."
                    value={formData.companyLogo}
                    onChange={(e) => setFormData({ ...formData, companyLogo: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://..."
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
              <CardDescription>Information about the position</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="jobTitle">Job Title *</Label>
                  <Input
                    id="jobTitle"
                    value={formData.jobTitle}
                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jobType">Job Type *</Label>
                  <Select
                    value={formData.jobType}
                    onValueChange={(value: 'full-time' | 'internship' | 'ppo') => 
                      setFormData({ ...formData, jobType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-time">Full Time</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                      <SelectItem value="ppo">PPO (Pre-Placement Offer)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="jobDescription">Job Description *</Label>
                <Textarea
                  id="jobDescription"
                  rows={5}
                  value={formData.jobDescription}
                  onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="workLocation">Work Location *</Label>
                  <Input
                    id="workLocation"
                    value={formData.workLocation}
                    onChange={(e) => setFormData({ ...formData, workLocation: e.target.value })}
                    required
                  />
                </div>
                <div className="flex items-center space-x-2 pt-8">
                  <Checkbox
                    id="isRemote"
                    checked={formData.isRemote}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, isRemote: checked as boolean })
                    }
                  />
                  <Label htmlFor="isRemote">Remote work available</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Package Details</CardTitle>
              <CardDescription>Compensation information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tier">Package Tier *</Label>
                  <Select
                    value={formData.tier}
                    onValueChange={(value: PlacementTier) => 
                      setFormData({ ...formData, tier: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="regular">Regular (&lt; 10 LPA)</SelectItem>
                      <SelectItem value="dream">Dream (10-20 LPA)</SelectItem>
                      <SelectItem value="superDream">Super Dream (&gt; 20 LPA)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="packageLPA">Package (LPA) *</Label>
                  <Input
                    id="packageLPA"
                    type="number"
                    step="0.1"
                    value={formData.packageLPA}
                    onChange={(e) => setFormData({ ...formData, packageLPA: e.target.value })}
                    required
                  />
                </div>
                {formData.jobType === 'internship' && (
                  <div className="space-y-2">
                    <Label htmlFor="stipendPerMonth">Stipend (per month)</Label>
                    <Input
                      id="stipendPerMonth"
                      type="number"
                      value={formData.stipendPerMonth}
                      onChange={(e) => setFormData({ ...formData, stipendPerMonth: e.target.value })}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Eligibility Criteria</CardTitle>
              <CardDescription>Requirements for applicants</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minCGPA">Minimum CGPA *</Label>
                  <Input
                    id="minCGPA"
                    type="number"
                    step="0.1"
                    max="10"
                    value={formData.minCGPA}
                    onChange={(e) => setFormData({ ...formData, minCGPA: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxBacklogs">Maximum Backlogs Allowed</Label>
                  <Input
                    id="maxBacklogs"
                    type="number"
                    min="0"
                    value={formData.maxBacklogs}
                    onChange={(e) => setFormData({ ...formData, maxBacklogs: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minTenthPercent">Minimum 10th %</Label>
                  <Input
                    id="minTenthPercent"
                    type="number"
                    max="100"
                    value={formData.minTenthPercent}
                    onChange={(e) => setFormData({ ...formData, minTenthPercent: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minTwelfthPercent">Minimum 12th %</Label>
                  <Input
                    id="minTwelfthPercent"
                    type="number"
                    max="100"
                    value={formData.minTwelfthPercent}
                    onChange={(e) => setFormData({ ...formData, minTwelfthPercent: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Allowed Programs *</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {PROGRAMS.map((program) => (
                    <div key={program.code} className="flex items-center space-x-2">
                      <Checkbox
                        id={program.code}
                        checked={formData.allowedPrograms.includes(program.code)}
                        onCheckedChange={() => toggleProgram(program.code)}
                      />
                      <Label htmlFor={program.code} className="text-sm">
                        {program.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
              <CardDescription>Important dates for the drive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="applicationDeadline">Application Deadline *</Label>
                  <Input
                    id="applicationDeadline"
                    type="datetime-local"
                    value={formData.applicationDeadline}
                    onChange={(e) => setFormData({ ...formData, applicationDeadline: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="driveDate">Drive Date</Label>
                  <Input
                    id="driveDate"
                    type="date"
                    value={formData.driveDate}
                    onChange={(e) => setFormData({ ...formData, driveDate: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Publication Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">Initial Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: DriveStatus) => 
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft (Hidden)</SelectItem>
                    <SelectItem value="upcoming">Upcoming (Visible)</SelectItem>
                    <SelectItem value="open">Open (Accepting Applications)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Draft drives are not visible to students. Choose &quot;Open&quot; to start accepting applications immediately.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Link href="/admin/drives">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Drive'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
