import { redirect, notFound } from 'next/navigation';
import { getSession, getUserProfile } from '@/actions/auth';
import { getDriveById, getApplicationStatus } from '@/actions/placement';
import { checkEligibility } from '@/lib/iips/eligibility-engine';
import { DriveDetailContent } from './drive-detail-content';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const drive = await getDriveById(id);
  
  return {
    title: drive ? `${drive.companyName} - ${drive.jobTitle}` : 'Drive Not Found',
    description: drive?.jobDescription?.substring(0, 160) ?? 'Placement drive details',
  };
}

export default async function DriveDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  const [profile, drive, applicationStatus] = await Promise.all([
    getUserProfile(),
    getDriveById(id),
    getApplicationStatus(id),
  ]);

  if (!profile) {
    redirect('/onboarding');
  }

  if (!drive) {
    notFound();
  }

  const eligibility = checkEligibility(profile, drive);
  
  // Check if actually applied (not withdrawn)
  const hasApplied = applicationStatus.hasApplied && !applicationStatus.isWithdrawn;
  const wasWithdrawn = applicationStatus.isWithdrawn ?? false;

  return (
    <DriveDetailContent 
      drive={drive} 
      eligibility={eligibility}
      hasApplied={hasApplied}
      hasResume={!!profile.resumeUrl}
      wasWithdrawn={wasWithdrawn}
    />
  );
}
