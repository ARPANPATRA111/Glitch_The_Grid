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
  ArrowLeft,
  Building2,
  Plus,
  Edit,
  Trash2,
  Globe,
  MapPin
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { createCompany, updateCompany, deleteCompany } from '@/actions/admin';
import type { Company } from '@/types/schema';

interface CompaniesManagementProps {
  companies: Company[];
}

type CompanyFormData = {
  name: string;
  industry: string;
  website: string;
  description: string;
  headquarters: string;
  hrContactName: string;
  hrContactEmail: string;
  hrContactPhone: string;
};

const emptyForm: CompanyFormData = {
  name: '',
  industry: '',
  website: '',
  description: '',
  headquarters: '',
  hrContactName: '',
  hrContactEmail: '',
  hrContactPhone: '',
};

export function CompaniesManagement({ companies: initialCompanies }: CompaniesManagementProps) {
  const [companies, setCompanies] = useState(initialCompanies);
  const [searchQuery, setSearchQuery] = useState('');
  const [industryFilter, setIndustryFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [formDialog, setFormDialog] = useState<{ open: boolean; mode: 'create' | 'edit'; companyId?: string }>({
    open: false,
    mode: 'create',
  });
  const [formData, setFormData] = useState<CompanyFormData>(emptyForm);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; companyId: string; companyName: string }>({
    open: false,
    companyId: '',
    companyName: '',
  });
  const { toast } = useToast();

  const industries = [...new Set(companies.map(c => c.industry))];

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = 
      company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.industry.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesIndustry = industryFilter === 'all' || company.industry === industryFilter;
    return matchesSearch && matchesIndustry;
  });

  const openCreateDialog = () => {
    setFormData(emptyForm);
    setFormDialog({ open: true, mode: 'create' });
  };

  const openEditDialog = (company: Company) => {
    const primaryContact = company.hrContacts?.[0];
    setFormData({
      name: company.name,
      industry: company.industry,
      website: company.website || '',
      description: company.description || '',
      headquarters: company.headquarters || '',
      hrContactName: primaryContact?.name || '',
      hrContactEmail: primaryContact?.email || '',
      hrContactPhone: primaryContact?.phone || '',
    });
    setFormDialog({ open: true, mode: 'edit', companyId: company.id });
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    
    const companyData = {
      name: formData.name,
      industry: formData.industry,
      website: formData.website || undefined,
      description: formData.description || undefined,
      headquarters: formData.headquarters || undefined,
      hrContacts: formData.hrContactEmail ? [{
        name: formData.hrContactName,
        email: formData.hrContactEmail,
        phone: formData.hrContactPhone || undefined,
      }] : [],
    };
    
    if (formDialog.mode === 'create') {
      const result = await createCompany(companyData);
      if (result.success && result.companyId) {
        setCompanies([...companies, { 
          id: result.companyId, 
          ...companyData,
          totalDrives: 0,
          totalHires: 0,
          averagePackageLPA: 0,
          hrContacts: companyData.hrContacts,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as Company]);
        toast({ title: 'Company created', description: 'New company has been added' });
        setFormDialog({ open: false, mode: 'create' });
      } else {
        toast({ title: 'Error', description: result.error, variant: 'destructive' });
      }
    } else if (formDialog.companyId) {
      const result = await updateCompany(formDialog.companyId, companyData);
      if (result.success) {
        setCompanies(companies.map(c => 
          c.id === formDialog.companyId ? { ...c, ...companyData, hrContacts: companyData.hrContacts } : c
        ));
        toast({ title: 'Company updated', description: 'Company details have been updated' });
        setFormDialog({ open: false, mode: 'create' });
      } else {
        toast({ title: 'Error', description: result.error, variant: 'destructive' });
      }
    }
    
    setIsLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteDialog.companyId) return;
    
    setIsLoading(true);
    const result = await deleteCompany(deleteDialog.companyId);
    
    if (result.success) {
      setCompanies(companies.filter(c => c.id !== deleteDialog.companyId));
      toast({ title: 'Company deleted', description: 'Company has been removed' });
      setDeleteDialog({ open: false, companyId: '', companyName: '' });
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
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
              <h1 className="text-2xl font-bold">Manage Companies</h1>
              <p className="text-muted-foreground">Add and manage recruiting companies</p>
            </div>
          </div>
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Add Company
          </Button>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Building2 className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{companies.length}</p>
                <p className="text-sm text-muted-foreground">Total Companies</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search companies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select 
                title='Industry Filter'
                value={industryFilter} 
                onChange={(e) => setIndustryFilter(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background"
              >
                <option value="all">All Industries</option>
                {industries.map(i => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Companies ({filteredCompanies.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead>Headquarters</TableHead>
                  <TableHead>Website</TableHead>
                  <TableHead>HR Contact</TableHead>
                  <TableHead>Stats</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCompanies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No companies found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCompanies.map((company) => (
                    <TableRow key={company.id}>
                      <TableCell className="font-medium">{company.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{company.industry}</Badge>
                      </TableCell>
                      <TableCell>
                        {company.headquarters && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            {company.headquarters}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {company.website && (
                          <a 
                            href={company.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-blue-600 hover:underline"
                          >
                            <Globe className="h-4 w-4" />
                            Website
                          </a>
                        )}
                      </TableCell>
                      <TableCell>
                        {company.hrContacts?.[0]?.email || '-'}
                      </TableCell>
                      <TableCell>
                        <div className="text-xs text-muted-foreground">
                          {company.totalDrives} drives · {company.totalHires} hires
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(company)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => setDeleteDialog({ 
                                open: true, 
                                companyId: company.id,
                                companyName: company.name
                              })}
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

      <Dialog open={formDialog.open} onOpenChange={(open) => setFormDialog({ ...formDialog, open })}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {formDialog.mode === 'create' ? 'Add New Company' : 'Edit Company'}
            </DialogTitle>
            <DialogDescription>
              {formDialog.mode === 'create' 
                ? 'Add a new recruiting company to the portal' 
                : 'Update company details'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Company Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Tech Corp"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="industry">Industry *</Label>
              <Input
                id="industry"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                placeholder="e.g., Information Technology"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="headquarters">Headquarters</Label>
              <Input
                id="headquarters"
                value={formData.headquarters}
                onChange={(e) => setFormData({ ...formData, headquarters: e.target.value })}
                placeholder="e.g., Bangalore, India"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="e.g., https://company.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hrContactName">HR Contact Name</Label>
              <Input
                id="hrContactName"
                value={formData.hrContactName}
                onChange={(e) => setFormData({ ...formData, hrContactName: e.target.value })}
                placeholder="HR Manager Name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hrContactEmail">HR Email</Label>
                <Input
                  id="hrContactEmail"
                  type="email"
                  value={formData.hrContactEmail}
                  onChange={(e) => setFormData({ ...formData, hrContactEmail: e.target.value })}
                  placeholder="hr@company.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hrContactPhone">HR Phone</Label>
                <Input
                  id="hrContactPhone"
                  value={formData.hrContactPhone}
                  onChange={(e) => setFormData({ ...formData, hrContactPhone: e.target.value })}
                  placeholder="+91 9999999999"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the company..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormDialog({ open: false, mode: 'create' })}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading || !formData.name || !formData.industry}>
              {formDialog.mode === 'create' ? 'Add Company' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Company</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{deleteDialog.companyName}</strong>? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog({ open: false, companyId: '', companyName: '' })}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
              Delete Company
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
