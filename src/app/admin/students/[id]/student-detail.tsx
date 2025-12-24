'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { 
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  GraduationCap,
  FileText,
  Building,
  Briefcase,
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  Ban,
  UserCheck,
  Loader2
} from 'lucide-react';
import type { UserProfile, Application, PlacementTier } from '@/types/schema';
import { markStudentAsPlaced } from '@/actions/admin';

interface StudentDetailProps {
  student: UserProfile;
  applications: Application[];
}

export function StudentDetail({ student, applications }: StudentDetailProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPlacingStudent, setIsPlacingStudent] = useState(false);
  const [placementDialogOpen, setPlacementDialogOpen] = useState(false);
  const [placementData, setPlacementData] = useState({
    companyName: '',
    packageLPA: 0,
    tier: 'regular' as PlacementTier,
  });

  const handleMarkAsPlaced = async () => {
    if (!placementData.companyName || placementData.packageLPA <= 0) {
      toast({
        title: 'Missing Information',
        description: 'Please provide company name and package.',
        variant: 'destructive',
      });
      return;
    }

    setIsPlacingStudent(true);
    try {
      const result = await markStudentAsPlaced(student.uid, {
        companyName: placementData.companyName,
        packageLPA: placementData.packageLPA,
        tier: placementData.tier,
      });

      if (result.success) {
        toast({
          title: 'Student Marked as Placed',
          description: `${student.fullName} has been marked as placed at ${placementData.companyName}.`,
        });
        setPlacementDialogOpen(false);
        router.refresh();
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to mark student as placed.',
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
      setIsPlacingStudent(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'under_review': return 'bg-blue-100 text-blue-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <Link href="/admin/students">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Students
            </Button>
          </Link>
          
          {!student.placementStatus.isPlaced && !student.placementStatus.isDebarred && (
            <Dialog open={placementDialogOpen} onOpenChange={setPlacementDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700">
                  <UserCheck className="h-4 w-4 mr-2" />
                  Mark as Placed
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Mark Student as Placed</DialogTitle>
                  <DialogDescription>
                    Enter the placement details for {student.fullName}.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="companyName">Company Name *</Label>
                    <Input
                      id="companyName"
                      placeholder="e.g., Google, TCS, Infosys"
                      value={placementData.companyName}
                      onChange={(e) => setPlacementData(prev => ({ ...prev, companyName: e.target.value }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="packageLPA">Package (LPA) *</Label>
                    <Input
                      id="packageLPA"
                      type="number"
                      placeholder="e.g., 12"
                      value={placementData.packageLPA || ''}
                      onChange={(e) => setPlacementData(prev => ({ ...prev, packageLPA: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="tier">Placement Tier *</Label>
                    <Select 
                      value={placementData.tier} 
                      onValueChange={(value: PlacementTier) => setPlacementData(prev => ({ ...prev, tier: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select tier" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="regular">Regular</SelectItem>
                        <SelectItem value="dream">Dream</SelectItem>
                        <SelectItem value="superDream">Super Dream</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setPlacementDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleMarkAsPlaced} disabled={isPlacingStudent}>
                    {isPlacingStudent && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Confirm Placement
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{student.fullName}</CardTitle>
                  <div className="flex gap-2">
                    {student.placementStatus.isDebarred && (
                      <Badge className="bg-red-100 text-red-800">
                        <Ban className="h-3 w-3 mr-1" />
                        Debarred
                      </Badge>
                    )}
                    {student.placementStatus.isPlaced && (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Placed
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <GraduationCap className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Roll Number</p>
                    <p className="font-medium">{student.rollNumber}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{student.email}</p>
                  </div>
                </div>
                {student.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{student.phone}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Date of Birth</p>
                    <p className="font-medium">
                      {student.dateOfBirth instanceof Date 
                        ? student.dateOfBirth.toLocaleDateString() 
                        : new Date(student.dateOfBirth).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Building className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Program</p>
                    <p className="font-medium">{student.programName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Award className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">CGPA</p>
                    <p className="font-medium">{student.cgpa}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Academic Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">10th %</p>
                    <p className="text-xl font-bold">{student.tenthPercentage}%</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">12th %</p>
                    <p className="text-xl font-bold">{student.twelfthPercentage}%</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Active Backlogs</p>
                    <p className="text-xl font-bold">{student.activeBacklogs}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Backlogs</p>
                    <p className="text-xl font-bold">{student.totalBacklogs}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Batch</p>
                    <p className="font-medium">{student.batch}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Passing Year</p>
                    <p className="font-medium">{student.passingYear}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Applications ({applications.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {applications.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No applications found
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Company</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Applied</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Round</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {applications.map((app) => (
                        <TableRow key={app.id}>
                          <TableCell className="font-medium">{app.companyName}</TableCell>
                          <TableCell>{app.tier} - ₹{app.packageLPA} LPA</TableCell>
                          <TableCell>
                            {new Date(app.appliedAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(app.status)}>
                              {app.status.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {app.currentRound ? `Round ${app.currentRound}` : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Resume
                </CardTitle>
              </CardHeader>
              <CardContent>
                {student.resumeUrl ? (
                  <Button asChild className="w-full">
                    <a href={student.resumeUrl} target="_blank" rel="noopener noreferrer">
                      View Resume
                    </a>
                  </Button>
                ) : (
                  <p className="text-center text-muted-foreground">
                    No resume uploaded
                  </p>
                )}
              </CardContent>
            </Card>

            {student.placementStatus.offers && student.placementStatus.offers.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Offers
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {student.placementStatus.offers.map((offer, index) => (
                    <div key={index} className="p-3 bg-green-50 rounded-lg">
                      <p className="font-medium">{offer.companyName}</p>
                      <p className="text-sm text-muted-foreground capitalize">{offer.tier} tier</p>
                      <p className="text-sm font-semibold text-green-600">
                        ₹{offer.packageLPA} LPA
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {student.skills && student.skills.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {student.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Profile Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Profile Complete</span>
                  {student.isProfileComplete ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span>Resume Uploaded</span>
                  {student.resumeUrl ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span>Resume Parsed</span>
                  {student.extractedSkills && student.extractedSkills.length > 0 ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <Clock className="h-5 w-5 text-yellow-600" />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
