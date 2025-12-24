'use client';

import { useState } from 'react';
import { completeProfile } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { GraduationCap, Loader2, User, BookOpen, MapPin } from 'lucide-react';

type Step = 'personal' | 'academic' | 'address';

interface FormData {
  rollNumber: string;
  fullName: string;
  phone: string;
  gender: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  dateOfBirth: string;
  cgpa: string;
  activeBacklogs: string;
  tenthPercentage: string;
  tenthBoard: string;
  tenthYear: string;
  twelfthPercentage: string;
  twelfthBoard: string;
  twelfthYear: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
}

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>('personal');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState<FormData>({
    rollNumber: '',
    fullName: '',
    phone: '',
    gender: 'prefer-not-to-say',
    dateOfBirth: '',
    cgpa: '',
    activeBacklogs: '0',
    tenthPercentage: '',
    tenthBoard: 'CBSE',
    tenthYear: '',
    twelfthPercentage: '',
    twelfthBoard: 'CBSE',
    twelfthYear: '',
    addressLine1: '',
    addressLine2: '',
    city: 'Indore',
    state: 'Madhya Pradesh',
    pincode: '',
  });

  const updateField = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      const result = await completeProfile({
        rollNumber: formData.rollNumber,
        fullName: formData.fullName,
        phone: formData.phone,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        cgpa: parseFloat(formData.cgpa) || 0,
        activeBacklogs: parseInt(formData.activeBacklogs) || 0,
        tenthPercentage: parseFloat(formData.tenthPercentage) || 0,
        tenthBoard: formData.tenthBoard,
        tenthYear: parseInt(formData.tenthYear) || 2020,
        twelfthPercentage: parseFloat(formData.twelfthPercentage) || 0,
        twelfthBoard: formData.twelfthBoard,
        twelfthYear: parseInt(formData.twelfthYear) || 2022,
        address: {
          line1: formData.addressLine1,
          line2: formData.addressLine2,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
        },
      });

      if (!result.success) {
        throw new Error(result.error ?? 'Failed to complete profile');
      }

      toast({
        title: 'Profile completed!',
        description: 'Welcome to IIPS Placement Portal.',
      });

      // Use window.location for full page navigation to ensure proper state refresh
      window.location.href = '/dashboard';
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 py-8">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <GraduationCap className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Complete Your Profile</h1>
          <p className="mt-2 text-muted-foreground">
            Please fill in your details to access the placement portal
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8 flex justify-center gap-2">
          {(['personal', 'academic', 'address'] as const).map((s, i) => (
            <div
              key={s}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                step === s
                  ? 'bg-primary text-primary-foreground'
                  : i < ['personal', 'academic', 'address'].indexOf(step)
                  ? 'bg-primary/20 text-primary'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {s === 'personal' && <User className="h-4 w-4" />}
              {s === 'academic' && <BookOpen className="h-4 w-4" />}
              {s === 'address' && <MapPin className="h-4 w-4" />}
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </div>
          ))}
        </div>

        {/* Form Card */}
        <Card>
          <CardHeader>
            <CardTitle>
              {step === 'personal' && 'Personal Information'}
              {step === 'academic' && 'Academic Details'}
              {step === 'address' && 'Address Information'}
            </CardTitle>
            <CardDescription>
              {step === 'personal' && 'Enter your basic personal details'}
              {step === 'academic' && 'Enter your academic information'}
              {step === 'address' && 'Enter your current address'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Personal Info Step */}
            {step === 'personal' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="rollNumber">Roll Number *</Label>
                  <Input
                    id="rollNumber"
                    placeholder="e.g., IC-2K22-45"
                    value={formData.rollNumber}
                    onChange={(e) => updateField('rollNumber', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Format: IC-2K22-45, IM-2K23-12, IT-2K21-08
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={(e) => updateField('fullName', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+91 9876543210"
                    value={formData.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender *</Label>
                  <select
                    title='s'
                    id="gender"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    value={formData.gender}
                    onChange={(e) => updateField('gender', e.target.value as FormData['gender'])}
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth *</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => updateField('dateOfBirth', e.target.value)}
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <Button onClick={() => setStep('academic')}>
                    Next: Academic Details
                  </Button>
                </div>
              </>
            )}

            {/* Academic Info Step */}
            {step === 'academic' && (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="cgpa">Current CGPA *</Label>
                    <Input
                      id="cgpa"
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      placeholder="e.g., 8.5"
                      value={formData.cgpa}
                      onChange={(e) => updateField('cgpa', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="backlogs">Active Backlogs</Label>
                    <Input
                      id="backlogs"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={formData.activeBacklogs}
                      onChange={(e) => updateField('activeBacklogs', e.target.value)}
                    />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="mb-3 font-medium">10th Standard</h4>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="tenthPercent">Percentage *</Label>
                      <Input
                        id="tenthPercent"
                        type="number"
                        step="0.1"
                        placeholder="85.5"
                        value={formData.tenthPercentage}
                        onChange={(e) => updateField('tenthPercentage', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tenthBoard">Board</Label>
                      <select
                        title="tenthBoard"
                        id="tenthBoard"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={formData.tenthBoard}
                        onChange={(e) => updateField('tenthBoard', e.target.value)}
                      >
                        <option value="CBSE">CBSE</option>
                        <option value="ICSE">ICSE</option>
                        <option value="MP Board">MP Board</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tenthYear">Year</Label>
                      <Input
                        id="tenthYear"
                        type="number"
                        placeholder="2020"
                        value={formData.tenthYear}
                        onChange={(e) => updateField('tenthYear', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="mb-3 font-medium">12th Standard</h4>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="twelfthPercent">Percentage *</Label>
                      <Input
                        id="twelfthPercent"
                        type="number"
                        step="0.1"
                        placeholder="80.0"
                        value={formData.twelfthPercentage}
                        onChange={(e) => updateField('twelfthPercentage', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="twelfthBoard">Board</Label>
                      <select
                        title='q'
                        id="twelfthBoard"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={formData.twelfthBoard}
                        onChange={(e) => updateField('twelfthBoard', e.target.value)}
                      >
                        <option value="CBSE">CBSE</option>
                        <option value="ICSE">ICSE</option>
                        <option value="MP Board">MP Board</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="twelfthYear">Year</Label>
                      <Input
                        id="twelfthYear"
                        type="number"
                        placeholder="2022"
                        value={formData.twelfthYear}
                        onChange={(e) => updateField('twelfthYear', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setStep('personal')}>
                    Back
                  </Button>
                  <Button onClick={() => setStep('address')}>
                    Next: Address
                  </Button>
                </div>
              </>
            )}

            {/* Address Step */}
            {step === 'address' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="addressLine1">Address Line 1 *</Label>
                  <Input
                    id="addressLine1"
                    placeholder="Street address, building name"
                    value={formData.addressLine1}
                    onChange={(e) => updateField('addressLine1', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="addressLine2">Address Line 2</Label>
                  <Input
                    id="addressLine2"
                    placeholder="Apartment, floor, landmark (optional)"
                    value={formData.addressLine2}
                    onChange={(e) => updateField('addressLine2', e.target.value)}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      placeholder="Indore"
                      value={formData.city}
                      onChange={(e) => updateField('city', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      placeholder="Madhya Pradesh"
                      value={formData.state}
                      onChange={(e) => updateField('state', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pincode">PIN Code *</Label>
                  <Input
                    id="pincode"
                    placeholder="452001"
                    maxLength={6}
                    value={formData.pincode}
                    onChange={(e) => updateField('pincode', e.target.value)}
                  />
                </div>

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setStep('academic')}>
                    Back
                  </Button>
                  <Button onClick={handleSubmit} disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Complete Profile'
                    )}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
