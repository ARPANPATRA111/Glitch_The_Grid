'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { updateProfile } from '@/actions/auth';
import { uploadResume, addSkill, removeSkill } from '@/actions/resume';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { MainNavbar } from '@/components/layout/main-navbar';
import { CategorizedSkills } from '@/components/skills';
import {
  User,
  Mail,
  Phone,
  MapPin,
  BookOpen,
  FileText,
  Upload,
  Loader2,
  Edit,
  Check,
  X,
  Briefcase,
  Award,
  Calendar,
  Plus,
} from 'lucide-react';
import type { UserProfile, Application } from '@/types/schema';

interface ProfileContentProps {
  profile: UserProfile;
  applications: Application[];
}

export function ProfileContent({ profile, applications }: ProfileContentProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [skills, setSkills] = useState<string[]>(profile.extractedSkills || []);
  const [newSkill, setNewSkill] = useState('');
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [removingSkill, setRemovingSkill] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    phone: profile.phone ?? '',
    cgpa: profile.cgpa?.toString() ?? '',
    activeBacklogs: profile.activeBacklogs?.toString() ?? '0',
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const result = await updateProfile({
        phone: formData.phone,
        cgpa: parseFloat(formData.cgpa),
        activeBacklogs: parseInt(formData.activeBacklogs),
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      toast({ title: 'Profile updated successfully' });
      setIsEditing(false);
      router.refresh();
    } catch (error) {
      toast({
        title: 'Failed to update profile',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a PDF file',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please upload a file smaller than 5MB',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const result = await uploadResume(formData);

      if (!result.success) {
        throw new Error(result.error);
      }

      toast({ 
        title: 'Resume uploaded successfully',
        description: result.extractedSkills?.length 
          ? `Extracted ${result.extractedSkills.length} skills: ${result.extractedSkills.slice(0, 5).join(', ')}${result.extractedSkills.length > 5 ? '...' : ''}`
          : undefined
      });
      if (result.extractedSkills) {
        setSkills(result.extractedSkills);
      }
      router.refresh();
    } catch (error) {
      toast({
        title: 'Failed to upload resume',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddSkill = async () => {
    if (!newSkill.trim()) return;
    
    setIsAddingSkill(true);
    try {
      const result = await addSkill(newSkill.trim());
      if (result.success && result.skills) {
        setSkills(result.skills);
        setNewSkill('');
        toast({ title: 'Skill added successfully' });
      } else {
        toast({
          title: 'Failed to add skill',
          description: result.error,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Failed to add skill',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsAddingSkill(false);
    }
  };

  const handleRemoveSkill = async (skill: string) => {
    setRemovingSkill(skill);
    try {
      const result = await removeSkill(skill);
      if (result.success && result.skills) {
        setSkills(result.skills);
        toast({ title: 'Skill removed' });
      } else {
        toast({
          title: 'Failed to remove skill',
          description: result.error,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Failed to remove skill',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setRemovingSkill(null);
    }
  };

  const recentApplications = applications.slice(0, 5);

  return (
    <div className="min-h-screen bg-background">
      <MainNavbar userName={profile.fullName} programName={profile.programName} />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">My Profile</h2>
            <p className="text-muted-foreground">{profile.rollNumber}</p>
          </div>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isSaving}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
                Save
              </Button>
            </div>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label className="text-muted-foreground">Full Name</Label>
                    <p className="font-medium">{profile.fullName}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Roll Number</Label>
                    <p className="font-medium">{profile.rollNumber}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Email</Label>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <p className="font-medium">{profile.email}</p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Phone</Label>
                    {isEditing ? (
                      <Input
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 9876543210"
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <p className="font-medium">{profile.phone || 'Not provided'}</p>
                      </div>
                    )}
                  </div>
                </div>

                {profile.address && (
                  <div>
                    <Label className="text-muted-foreground">Address</Label>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                      <p className="font-medium">
                        {profile.address.line1}
                        {profile.address.line2 && `, ${profile.address.line2}`}
                        <br />
                        {profile.address.city}, {profile.address.state} - {profile.address.pincode}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Academic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label className="text-muted-foreground">Program</Label>
                    <p className="font-medium">{profile.programName}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Batch</Label>
                    <p className="font-medium">{profile.batch}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Current CGPA</Label>
                    {isEditing ? (
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="10"
                        value={formData.cgpa}
                        onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
                      />
                    ) : (
                      <p className="font-medium text-lg">{profile.cgpa?.toFixed(2) ?? 'N/A'}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Active Backlogs</Label>
                    {isEditing ? (
                      <Input
                        type="number"
                        min="0"
                        value={formData.activeBacklogs}
                        onChange={(e) => setFormData({ ...formData, activeBacklogs: e.target.value })}
                      />
                    ) : (
                      <p className="font-medium">{profile.activeBacklogs ?? 0}</p>
                    )}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label className="text-muted-foreground">10th Percentage</Label>
                      <p className="font-medium">{profile.tenthPercentage}% ({profile.tenthBoard})</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">12th Percentage</Label>
                      <p className="font-medium">{profile.twelfthPercentage}% ({profile.twelfthBoard})</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Recent Applications
                  </CardTitle>
                  <Link href="/applications">
                    <Button variant="ghost" size="sm">View All</Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {recentApplications.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No applications yet. <Link href="/drives" className="text-primary hover:underline">Browse drives</Link>
                  </p>
                ) : (
                  <div className="space-y-3">
                    {recentApplications.map((app) => (
                      <div key={app.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium">{app.companyName}</p>
                          <p className="text-sm text-muted-foreground capitalize">{app.tier} tier - ₹{app.packageLPA} LPA</p>
                        </div>
                        <Badge variant={app.status === 'selected' ? 'default' : 'secondary'}>
                          {app.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Placement Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4">
                  {profile.placementStatus?.isPlaced ? (
                    <>
                      <Badge className="bg-green-100 text-green-800 text-lg px-4 py-2">
                        Placed
                      </Badge>
                      {profile.placementStatus.currentTier && (
                        <p className="mt-2 text-muted-foreground">
                          {profile.placementStatus.currentTier.replace('_', ' ')} Offer
                        </p>
                      )}
                    </>
                  ) : (
                    <>
                      <Badge variant="secondary" className="text-lg px-4 py-2">
                        Not Placed
                      </Badge>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Eligible for all tiers
                      </p>
                    </>
                  )}
                </div>

                <div className="border-t pt-4 mt-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold">{applications.length}</p>
                      <p className="text-xs text-muted-foreground">Applications</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {applications.filter(a => a.status === 'shortlisted' || a.status === 'round-1' || a.status === 'round-2' || a.status === 'round-3').length}
                      </p>
                      <p className="text-xs text-muted-foreground">In Progress</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Resume
                </CardTitle>
                <CardDescription>
                  Upload your latest resume (PDF, max 5MB)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <input
                title='a'
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={handleFileSelect}
                />

                {profile.resumeUrl ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <FileText className="h-8 w-8 text-green-600" />
                      <div className="flex-1">
                        <p className="font-medium text-green-800">Resume Uploaded</p>
                        <p className="text-xs text-green-600">
                          Last updated: {profile.resumeUpdatedAt ? new Date(profile.resumeUpdatedAt).toLocaleDateString() : 'Unknown'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => window.open(profile.resumeUrl, '_blank')}
                      >
                        View
                      </Button>
                      <Button
                        className="flex-1"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                      >
                        {isUploading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            Replace
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {isUploading ? (
                      <Loader2 className="h-8 w-8 mx-auto animate-spin text-muted-foreground" />
                    ) : (
                      <>
                        <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Click to upload your resume
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          PDF format, max 5MB
                        </p>
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Skills
                </CardTitle>
                <CardDescription>
                  {skills.length > 0 ? 'Manage your skills - add or remove as needed' : 'Upload a resume to extract skills or add manually'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a skill (e.g., React, Python)"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
                    disabled={isAddingSkill}
                  />
                  <Button
                    size="sm"
                    onClick={handleAddSkill}
                    disabled={isAddingSkill || !newSkill.trim()}
                  >
                    {isAddingSkill ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {skills.length > 0 ? (
                  <div className="space-y-4">
                    <CategorizedSkills 
                      skills={skills} 
                      collapsible={false}
                    />
                    
                    <div className="border-t pt-4">
                      <p className="text-sm text-muted-foreground mb-2">Click to remove a skill:</p>
                      <div className="flex flex-wrap gap-2">
                        {skills.map((skill, idx) => (
                          <Badge 
                            key={idx} 
                            variant="secondary" 
                            className="text-sm pr-1 flex items-center gap-1 group"
                          >
                            {skill}
                            <button
                              onClick={() => handleRemoveSkill(skill)}
                              disabled={removingSkill === skill}
                              className="ml-1 p-0.5 rounded-full hover:bg-red-100 hover:text-red-600 transition-colors"
                            >
                              {removingSkill === skill ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <X className="h-3 w-3" />
                              )}
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-2">
                    No skills added yet
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/drives" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Briefcase className="h-4 w-4 mr-2" />
                    Browse Placement Drives
                  </Button>
                </Link>
                <Link href="/applications" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="h-4 w-4 mr-2" />
                    View All Applications
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
