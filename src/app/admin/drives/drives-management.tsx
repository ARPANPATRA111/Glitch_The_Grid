'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
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
  Plus, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye,
  ArrowLeft,
  Building2,
  Users,
  CheckCircle2
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { updateDriveStatus, deleteDrive } from '@/actions/admin';
import type { PlacementDrive, DriveStatus } from '@/types/schema';

interface DrivesManagementProps {
  drives: PlacementDrive[];
}

const statusColors: Record<DriveStatus, string> = {
  draft: 'bg-gray-100 text-gray-800',
  upcoming: 'bg-blue-100 text-blue-800',
  open: 'bg-green-100 text-green-800',
  closed: 'bg-yellow-100 text-yellow-800',
  'in-progress': 'bg-purple-100 text-purple-800',
  completed: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-red-100 text-red-800',
};

const tierColors: Record<string, string> = {
  regular: 'bg-gray-100 text-gray-800',
  dream: 'bg-blue-100 text-blue-800',
  superDream: 'bg-purple-100 text-purple-800',
  super_dream: 'bg-purple-100 text-purple-800',
};

export function DrivesManagement({ drives: initialDrives }: DrivesManagementProps) {
  const [drives, setDrives] = useState(initialDrives);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const filteredDrives = drives.filter(drive => {
    const matchesSearch = 
      drive.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      drive.jobTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || drive.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (driveId: string, status: DriveStatus) => {
    setIsLoading(driveId);
    const result = await updateDriveStatus(driveId, status);
    
    if (result.success) {
      setDrives(drives.map(d => 
        d.id === driveId ? { ...d, status } : d
      ));
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
    setIsLoading(null);
  };

  const handleDelete = async (driveId: string) => {
    if (!confirm('Are you sure you want to delete this drive?')) return;
    
    setIsLoading(driveId);
    const result = await deleteDrive(driveId);
    
    if (result.success) {
      setDrives(drives.filter(d => d.id !== driveId));
      toast({
        title: 'Drive deleted',
        description: 'The drive has been deleted successfully',
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

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return 'N/A';
    try {
      return format(new Date(date), 'MMM d, yyyy');
    } catch {
      return 'N/A';
    }
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
              <h1 className="text-2xl font-bold">Manage Drives</h1>
              <p className="text-muted-foreground">Create and manage placement drives</p>
            </div>
          </div>
          <Link href="/admin/drives/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Drive
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Building2 className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{drives.length}</p>
                  <p className="text-sm text-muted-foreground">Total Drives</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {drives.filter(d => d.status === 'open').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Open Drives</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {drives.reduce((sum, d) => sum + d.applicantCount, 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Applications</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {drives.reduce((sum, d) => sum + d.selectedCount, 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Selections</p>
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
                  placeholder="Search by company or job title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>All Drives ({filteredDrives.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Job Title</TableHead>
                  <TableHead>Package</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead>Applications</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDrives.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No drives found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDrives.map((drive) => (
                    <TableRow key={drive.id}>
                      <TableCell className="font-medium">{drive.companyName}</TableCell>
                      <TableCell>{drive.jobTitle}</TableCell>
                      <TableCell>{drive.packageLPA} LPA</TableCell>
                      <TableCell>
                        <Badge className={tierColors[drive.tier] || tierColors.regular}>
                          {drive.tier}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[drive.status]}>
                          {drive.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(drive.applicationDeadline)}</TableCell>
                      <TableCell>
                        <span className="font-medium">{drive.applicantCount}</span>
                        <span className="text-muted-foreground"> / </span>
                        <span className="text-green-600">{drive.selectedCount}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              disabled={isLoading === drive.id}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/drives/${drive.id}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/drives/${drive.id}`}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleStatusChange(drive.id, 'open')}
                              disabled={drive.status === 'open'}
                            >
                              Open Drive
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleStatusChange(drive.id, 'closed')}
                              disabled={drive.status === 'closed'}
                            >
                              Close Drive
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleStatusChange(drive.id, 'completed')}
                            >
                              Mark Complete
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(drive.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
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
    </div>
  );
}
