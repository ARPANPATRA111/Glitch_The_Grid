'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Search, 
  MoreHorizontal, 
  Eye,
  ArrowLeft,
  Users,
  CheckCircle2,
  XCircle,
  Ban,
  FileText,
  Download
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { updateStudentStatus } from '@/actions/admin';
import type { UserProfile } from '@/types/schema';

interface StudentsManagementProps {
  students: UserProfile[];
}

export function StudentsManagement({ students: initialStudents }: StudentsManagementProps) {
  const [students, setStudents] = useState(initialStudents);
  const [searchQuery, setSearchQuery] = useState('');
  const [programFilter, setProgramFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [debarDialog, setDebarDialog] = useState<{ open: boolean; studentId: string; studentName: string }>({
    open: false,
    studentId: '',
    studentName: '',
  });
  const [debarReason, setDebarReason] = useState('');
  const { toast } = useToast();

  const programs = [...new Set(students.map(s => s.programCode))];

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProgram = programFilter === 'all' || student.programCode === programFilter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'placed' && student.placementStatus.isPlaced) ||
      (statusFilter === 'unplaced' && !student.placementStatus.isPlaced) ||
      (statusFilter === 'debarred' && student.placementStatus.isDebarred);
    return matchesSearch && matchesProgram && matchesStatus;
  });

  const handleDebar = async () => {
    if (!debarDialog.studentId) return;
    
    setIsLoading(debarDialog.studentId);
    const result = await updateStudentStatus(debarDialog.studentId, {
      isDebarred: true,
      debarmentReason: debarReason,
    });
    
    if (result.success) {
      setStudents(students.map(s => 
        s.uid === debarDialog.studentId 
          ? { ...s, placementStatus: { ...s.placementStatus, isDebarred: true } }
          : s
      ));
      toast({
        title: 'Student debarred',
        description: `${debarDialog.studentName} has been debarred from placements`,
      });
      setDebarDialog({ open: false, studentId: '', studentName: '' });
      setDebarReason('');
    } else {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      });
    }
    setIsLoading(null);
  };

  const handleRemoveDebar = async (studentId: string) => {
    setIsLoading(studentId);
    const result = await updateStudentStatus(studentId, { isDebarred: false });
    
    if (result.success) {
      setStudents(students.map(s => 
        s.uid === studentId 
          ? { ...s, placementStatus: { ...s.placementStatus, isDebarred: false } }
          : s
      ));
      toast({
        title: 'Debarment removed',
        description: 'Student can now apply for placements',
      });
    } else {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      });
    }
    setIsLoading(null);
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Roll Number', 'Email', 'Program', 'CGPA', 'Placement Status', 'Company'];
    const rows = filteredStudents.map(s => [
      s.fullName,
      s.rollNumber,
      s.email,
      s.programName,
      s.cgpa,
      s.placementStatus.isPlaced ? 'Placed' : 'Not Placed',
      s.placementStatus.offers?.[0]?.companyName || '-'
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'students-export.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const placedCount = students.filter(s => s.placementStatus.isPlaced).length;
  const unplacedCount = students.filter(s => !s.placementStatus.isPlaced && !s.placementStatus.isDebarred).length;
  const debarredCount = students.filter(s => s.placementStatus.isDebarred).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Manage Students</h1>
              <p className="text-muted-foreground">View and manage student profiles</p>
            </div>
          </div>
          <Button onClick={exportToCSV} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{students.length}</p>
                  <p className="text-sm text-muted-foreground">Total Students</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{placedCount}</p>
                  <p className="text-sm text-muted-foreground">Placed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <XCircle className="h-8 w-8 text-yellow-600" />
                <div>
                  <p className="text-2xl font-bold">{unplacedCount}</p>
                  <p className="text-sm text-muted-foreground">Unplaced</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Ban className="h-8 w-8 text-red-600" />
                <div>
                  <p className="text-2xl font-bold">{debarredCount}</p>
                  <p className="text-sm text-muted-foreground">Debarred</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, roll number, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={programFilter} onValueChange={setProgramFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Program" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Programs</SelectItem>
                  {programs.map(p => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="placed">Placed</SelectItem>
                  <SelectItem value="unplaced">Unplaced</SelectItem>
                  <SelectItem value="debarred">Debarred</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Students ({filteredStudents.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Roll Number</TableHead>
                  <TableHead>Program</TableHead>
                  <TableHead>CGPA</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No students found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map((student) => (
                    <TableRow key={student.uid}>
                      <TableCell className="font-medium">{student.fullName}</TableCell>
                      <TableCell>{student.rollNumber}</TableCell>
                      <TableCell>{student.programCode}</TableCell>
                      <TableCell>{student.cgpa}</TableCell>
                      <TableCell>
                        {student.placementStatus.isDebarred ? (
                          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Debarred</Badge>
                        ) : student.placementStatus.isPlaced ? (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Placed</Badge>
                        ) : (
                          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Unplaced</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {student.placementStatus.offers?.[0]?.companyName || '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              disabled={isLoading === student.uid}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/students/${student.uid}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Profile
                              </Link>
                            </DropdownMenuItem>
                            {student.resumeUrl && (
                              <DropdownMenuItem asChild>
                                <a href={student.resumeUrl} target="_blank" rel="noopener noreferrer">
                                  <FileText className="h-4 w-4 mr-2" />
                                  View Resume
                                </a>
                              </DropdownMenuItem>
                            )}
                            {student.placementStatus.isDebarred ? (
                              <DropdownMenuItem 
                                onClick={() => handleRemoveDebar(student.uid)}
                              >
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Remove Debarment
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem 
                                onClick={() => setDebarDialog({ 
                                  open: true, 
                                  studentId: student.uid,
                                  studentName: student.fullName
                                })}
                                className="text-red-600"
                              >
                                <Ban className="h-4 w-4 mr-2" />
                                Debar Student
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={debarDialog.open} onOpenChange={(open) => setDebarDialog({ ...debarDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Debar Student</DialogTitle>
            <DialogDescription>
              Are you sure you want to debar <strong>{debarDialog.studentName}</strong> from placements?
              This will prevent them from applying to any drives.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Debarment</Label>
              <Textarea
                id="reason"
                placeholder="Enter reason for debarment..."
                value={debarReason}
                onChange={(e) => setDebarReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDebarDialog({ open: false, studentId: '', studentName: '' })}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDebar} disabled={!debarReason}>
              Debar Student
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
