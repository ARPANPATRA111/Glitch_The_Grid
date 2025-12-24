'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
  DropdownMenuSeparator,
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
import { 
  Search, 
  MoreHorizontal, 
  ArrowLeft,
  FileCheck,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  FileText,
  Download,
  UserCheck,
  UserX
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { updateApplicationStatus, bulkUpdateApplicationStatus, markApplicationAsPlaced } from '@/actions/admin';
import type { Application, ApplicationStatus } from '@/types/schema';

interface ApplicationsManagementProps {
  applications: Application[];
}

const statusOptions: ApplicationStatus[] = ['applied', 'shortlisted', 'round-1', 'round-2', 'round-3', 'selected', 'rejected', 'withdrawn'];

export function ApplicationsManagement({ applications: initialApplications }: ApplicationsManagementProps) {
  const [applications, setApplications] = useState(initialApplications);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [companyFilter, setCompanyFilter] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [placedDialog, setPlacedDialog] = useState<{ open: boolean; application: Application | null }>({
    open: false,
    application: null,
  });
  const { toast } = useToast();

  const companies = [...new Set(applications.map(a => a.companyName))];

  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.tier.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchesCompany = companyFilter === 'all' || app.companyName === companyFilter;
    return matchesSearch && matchesStatus && matchesCompany;
  });

  const handleStatusChange = async (applicationId: string, newStatus: Application['status']) => {
    setIsLoading(true);
    const result = await updateApplicationStatus(applicationId, newStatus);
    
    if (result.success) {
      setApplications(applications.map(a => 
        a.id === applicationId ? { ...a, status: newStatus } : a
      ));
      toast({
        title: 'Status updated',
        description: `Application status changed to ${newStatus.replace('_', ' ')}`,
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

  const handleMarkAsPlaced = async () => {
    if (!placedDialog.application) return;
    
    setIsLoading(true);
    const result = await markApplicationAsPlaced(placedDialog.application.id);
    
    if (result.success) {
      setApplications(applications.map(a => 
        a.id === placedDialog.application!.id ? { ...a, status: 'selected', offerAccepted: true } : a
      ));
      toast({
        title: 'Student marked as placed',
        description: `${placedDialog.application.studentName} has been marked as placed at ${placedDialog.application.companyName}`,
      });
      setPlacedDialog({ open: false, application: null });
    } else {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      });
    }
    setIsLoading(false);
  };

  const handleBulkUpdate = async (newStatus: Application['status']) => {
    if (selectedIds.length === 0) return;
    
    setIsLoading(true);
    const result = await bulkUpdateApplicationStatus(selectedIds, newStatus);
    
    if (result.success) {
      setApplications(applications.map(a => 
        selectedIds.includes(a.id) ? { ...a, status: newStatus } : a
      ));
      setSelectedIds([]);
      toast({
        title: 'Bulk update complete',
        description: `${selectedIds.length} applications updated to ${newStatus.replace('_', ' ')}`,
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

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredApplications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredApplications.map(a => a.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      applied: 'bg-blue-100 text-blue-800',
      shortlisted: 'bg-purple-100 text-purple-800',
      'round-1': 'bg-indigo-100 text-indigo-800',
      'round-2': 'bg-cyan-100 text-cyan-800',
      'round-3': 'bg-teal-100 text-teal-800',
      selected: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      withdrawn: 'bg-gray-100 text-gray-800',
    };
    return <Badge className={colors[status] || 'bg-gray-100'}>{status.replace('-', ' ')}</Badge>;
  };

  const exportToCSV = () => {
    const headers = ['Student', 'Company', 'Package (LPA)', 'Applied Date', 'Status', 'Current Round'];
    const rows = filteredApplications.map(a => [
      a.studentName,
      a.companyName,
      a.packageLPA,
      new Date(a.appliedAt).toLocaleDateString(),
      a.status,
      a.currentRound || '-'
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'applications-export.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const statusCounts = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'applied' || a.status === 'shortlisted').length,
    selected: applications.filter(a => a.status === 'selected').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  };

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
              <h1 className="text-2xl font-bold">Manage Applications</h1>
              <p className="text-muted-foreground">Review and process student applications</p>
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
                <FileCheck className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{statusCounts.total}</p>
                  <p className="text-sm text-muted-foreground">Total Applications</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div>
                  <p className="text-2xl font-bold">{statusCounts.pending}</p>
                  <p className="text-sm text-muted-foreground">Pending Review</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{statusCounts.selected}</p>
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
                  <p className="text-2xl font-bold">{statusCounts.rejected}</p>
                  <p className="text-sm text-muted-foreground">Rejected</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {selectedIds.length > 0 && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <p className="font-medium">{selectedIds.length} applications selected</p>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleBulkUpdate('shortlisted')}
                    disabled={isLoading}
                  >
                    Shortlist All
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleBulkUpdate('rejected')}
                    disabled={isLoading}
                  >
                    Reject All
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSelectedIds([])}
                  >
                    Clear Selection
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by student, company, or job title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={companyFilter} onValueChange={setCompanyFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Company" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Companies</SelectItem>
                  {companies.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {statusOptions.map(s => (
                    <SelectItem key={s} value={s}>{s.replace('_', ' ')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Applications ({filteredApplications.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox 
                      checked={selectedIds.length === filteredApplications.length && filteredApplications.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Package (LPA)</TableHead>
                  <TableHead>Applied</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Round</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No applications found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredApplications.map((application) => (
                    <TableRow key={application.id}>
                      <TableCell>
                        <Checkbox 
                          checked={selectedIds.includes(application.id)}
                          onCheckedChange={() => toggleSelect(application.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{application.studentName}</TableCell>
                      <TableCell>{application.companyName}</TableCell>
                      <TableCell>₹{application.packageLPA} LPA</TableCell>
                      <TableCell>
                        {new Date(application.appliedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{getStatusBadge(application.status)}</TableCell>
                      <TableCell>{application.currentRound ? `Round ${application.currentRound}` : '-'}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" disabled={isLoading}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/students/${application.studentId}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Student
                              </Link>
                            </DropdownMenuItem>
                            {application.resumeUrl && (
                              <DropdownMenuItem asChild>
                                <a href={application.resumeUrl} target="_blank" rel="noopener noreferrer">
                                  <FileText className="h-4 w-4 mr-2" />
                                  View Resume
                                </a>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => setPlacedDialog({ open: true, application })}
                              className="text-green-600"
                              disabled={application.status === 'selected'}
                            >
                              <UserCheck className="h-4 w-4 mr-2" />
                              Mark as Placed
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleStatusChange(application.id, 'rejected')}
                              className="text-red-600"
                              disabled={application.status === 'rejected'}
                            >
                              <UserX className="h-4 w-4 mr-2" />
                              Mark as Rejected
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {statusOptions.map(status => (
                              <DropdownMenuItem 
                                key={status}
                                onClick={() => handleStatusChange(application.id, status as Application['status'])}
                                disabled={application.status === status}
                              >
                                Set as {status.replace('-', ' ')}
                              </DropdownMenuItem>
                            ))}
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

      <Dialog open={placedDialog.open} onOpenChange={(open) => setPlacedDialog({ ...placedDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Student as Placed</DialogTitle>
            <DialogDescription>
              Are you sure you want to mark <strong>{placedDialog.application?.studentName}</strong> as placed?
            </DialogDescription>
          </DialogHeader>
          
          {placedDialog.application && (
            <div className="space-y-4 py-4">
              <div className="bg-green-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Company</span>
                  <span className="font-medium">{placedDialog.application.companyName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Package</span>
                  <span className="font-medium">₹{placedDialog.application.packageLPA} LPA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Tier</span>
                  <span className="font-medium capitalize">{placedDialog.application.tier}</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                This will mark the student as placed and update their placement status. The placement will be reflected in analytics.
              </p>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setPlacedDialog({ open: false, application: null })}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleMarkAsPlaced} 
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              <UserCheck className="h-4 w-4 mr-2" />
              Confirm Placement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
