'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  ArrowLeft, 
  Loader2, 
  Users, 
  CheckCircle2, 
  XCircle,
  Clock 
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { updateDrive, updateApplicationStatus, updateDriveStatus } from '@/actions/admin';
import type { PlacementDrive, Application, DriveStatus, ApplicationStatus } from '@/types/schema';

// Program codes must match PROGRAM_PREFIX_MAP in roll-parser.ts
const PROGRAMS = [
  { code: 'MCA_INT', name: 'MCA (Integrated)' },
  { code: 'MBA_MS', name: 'MBA (Management Science)' },
  { code: 'MTECH_IT', name: 'M.Tech (IT)' },
  { code: 'MBA_APR', name: 'MBA (Advertising & PR)' },
  { code: 'MBA_ENT', name: 'MBA (Entrepreneurship)' },
  { code: 'BCOM_HONS', name: 'B.Com (Hons)' },
];

const statusColors: Record<ApplicationStatus, string> = {
  applied: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  shortlisted: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  'round-1': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  'round-2': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  'round-3': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  selected: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  withdrawn: 'bg-muted text-muted-foreground',
};

interface EditDriveFormProps {
  drive: PlacementDrive;
  applications: Application[];
}

export function EditDriveForm({ drive, applications: initialApplications }: EditDriveFormProps) {
  useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [applications, setApplications] = useState(initialApplications);
  const [selectedApplications, setSelectedApplications] = useState<string[]>([]);

  const formatDateForInput = (date: string | Date | undefined) => {
    if (!date) return '';
    try {
      const d = new Date(date);
      return d.toISOString().slice(0, 16);
    } catch {
      return '';
    }
  };

  const [formData, setFormData] = useState({
    companyName: drive.companyName,
    companyLogo: drive.companyLogo || '',
    industry: drive.industry,
    website: drive.website || '',
    jobTitle: drive.jobTitle,
    jobDescription: drive.jobDescription,
    jobType: drive.jobType,
    workLocation: drive.workLocation,
    isRemote: drive.isRemote,
    tier: drive.tier,
    packageLPA: drive.packageLPA.toString(),
    stipendPerMonth: drive.stipendPerMonth?.toString() || '',
    minCGPA: drive.eligibility.minCGPA.toString(),
    maxBacklogs: (drive.eligibility.maxBacklogs || 0).toString(),
    allowedPrograms: drive.eligibility.allowedPrograms,
    minTenthPercent: drive.eligibility.minTenthPercent?.toString() || '',
    minTwelfthPercent: drive.eligibility.minTwelfthPercent?.toString() || '',
    applicationDeadline: formatDateForInput(drive.applicationDeadline),
    driveDate: drive.driveDate ? new Date(drive.driveDate).toISOString().slice(0, 10) : '',
    status: drive.status,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await updateDrive(drive.id, {
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
          title: 'Drive updated!',
          description: 'The placement drive has been updated successfully.',
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update drive',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (status: DriveStatus) => {
    setIsLoading(true);
    const result = await updateDriveStatus(drive.id, status);
    
    if (result.success) {
      setFormData({ ...formData, status });
      toast({
        title: 'Status updated',
        description: `Drive status changed to ${status}`,
      });
    } else {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      });
    }
    setIsLoading(false);
  };

  const handleApplicationStatusChange = async (appId: string, status: ApplicationStatus) => {
    const result = await updateApplicationStatus(appId, status);
    
    if (result.success) {
      setApplications(applications.map(a => 
        a.id === appId ? { ...a, status } : a
      ));
      toast({
        title: 'Status updated',
        description: `Application status changed to ${status}`,
      });
    } else {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      });
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

  const toggleApplicationSelection = (appId: string) => {
    setSelectedApplications(prev =>
      prev.includes(appId)
        ? prev.filter(id => id !== appId)
        : [...prev, appId]
    );
  };

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return 'N/A';
    try {
      return format(new Date(date), 'MMM d, yyyy');
    } catch {
      return 'N/A';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin/drives">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">{drive.companyName}</h1>
              <p className="text-muted-foreground">{drive.jobTitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={
              formData.status === 'open' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
              formData.status === 'closed' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
              'bg-muted text-muted-foreground'
            }>
              {formData.status}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{drive.applicantCount}</p>
                  <p className="text-sm text-muted-foreground">Total Applicants</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div>
                  <p className="text-2xl font-bold">{drive.shortlistedCount}</p>
                  <p className="text-sm text-muted-foreground">Shortlisted</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{drive.selectedCount}</p>
                  <p className="text-sm text-muted-foreground">Selected</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <XCircle className="h-8 w-8 text-red-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {applications.filter(a => a.status === 'rejected').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Rejected</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="details" className="space-y-6">
          <TabsList>
            <TabsTrigger value="details">Drive Details</TabsTrigger>
            <TabsTrigger value="applications">
              Applications ({applications.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <form onSubmit={handleSubmit} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant={formData.status === 'open' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleStatusChange('open')}
                      disabled={isLoading}
                    >
                      Open Drive
                    </Button>
                    <Button
                      type="button"
                      variant={formData.status === 'closed' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleStatusChange('closed')}
                      disabled={isLoading}
                    >
                      Close Applications
                    </Button>
                    <Button
                      type="button"
                      variant={formData.status === 'in-progress' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleStatusChange('in-progress')}
                      disabled={isLoading}
                    >
                      Mark In Progress
                    </Button>
                    <Button
                      type="button"
                      variant={formData.status === 'completed' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleStatusChange('completed')}
                      disabled={isLoading}
                    >
                      Mark Completed
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Company Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company Name</Label>
                      <Input
                        id="companyName"
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="industry">Industry</Label>
                      <Input
                        id="industry"
                        value={formData.industry}
                        onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Job Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="jobTitle">Job Title</Label>
                      <Input
                        id="jobTitle"
                        value={formData.jobTitle}
                        onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="packageLPA">Package (LPA)</Label>
                      <Input
                        id="packageLPA"
                        type="number"
                        step="0.1"
                        value={formData.packageLPA}
                        onChange={(e) => setFormData({ ...formData, packageLPA: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jobDescription">Job Description</Label>
                    <Textarea
                      id="jobDescription"
                      rows={5}
                      value={formData.jobDescription}
                      onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Eligibility Criteria</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="minCGPA">Minimum CGPA</Label>
                      <Input
                        id="minCGPA"
                        type="number"
                        step="0.1"
                        max="10"
                        value={formData.minCGPA}
                        onChange={(e) => setFormData({ ...formData, minCGPA: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxBacklogs">Maximum Backlogs</Label>
                      <Input
                        id="maxBacklogs"
                        type="number"
                        min="0"
                        value={formData.maxBacklogs}
                        onChange={(e) => setFormData({ ...formData, maxBacklogs: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Allowed Programs</Label>
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
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="applicationDeadline">Application Deadline</Label>
                      <Input
                        id="applicationDeadline"
                        type="datetime-local"
                        value={formData.applicationDeadline}
                        onChange={(e) => setFormData({ ...formData, applicationDeadline: e.target.value })}
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
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="applications">
            <Card>
              <CardHeader>
                <CardTitle>Applications</CardTitle>
                <CardDescription>Manage applications for this drive</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">
                        <Checkbox
                          checked={selectedApplications.length === applications.length}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedApplications(applications.map(a => a.id));
                            } else {
                              setSelectedApplications([]);
                            }
                          }}
                        />
                      </TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Roll Number</TableHead>
                      <TableHead>CGPA</TableHead>
                      <TableHead>Program</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Applied On</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          No applications yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      applications.map((app) => (
                        <TableRow key={app.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedApplications.includes(app.id)}
                              onCheckedChange={() => toggleApplicationSelection(app.id)}
                            />
                          </TableCell>
                          <TableCell className="font-medium">{app.studentName}</TableCell>
                          <TableCell>{app.studentRollNumber}</TableCell>
                          <TableCell>{app.studentCGPA}</TableCell>
                          <TableCell>{app.studentProgram}</TableCell>
                          <TableCell>
                            <Badge className={statusColors[app.status]}>
                              {app.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(app.appliedAt)}</TableCell>
                          <TableCell>
                            <Select
                              value={app.status}
                              onValueChange={(value: ApplicationStatus) => 
                                handleApplicationStatusChange(app.id, value)
                              }
                            >
                              <SelectTrigger className="w-[130px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="applied">Applied</SelectItem>
                                <SelectItem value="shortlisted">Shortlisted</SelectItem>
                                <SelectItem value="round-1">Round 1</SelectItem>
                                <SelectItem value="round-2">Round 2</SelectItem>
                                <SelectItem value="round-3">Round 3</SelectItem>
                                <SelectItem value="selected">Selected</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
