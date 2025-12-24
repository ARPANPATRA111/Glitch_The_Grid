import { redirect } from 'next/navigation';
import { getSession, getUserProfile } from '@/actions/auth';
import { getOpenDrives, getMyApplications } from '@/actions/placement';
import { DashboardContent } from './dashboard-content';

export const metadata = {
  title: 'Dashboard',
  description: 'Your placement dashboard',
};

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  const profile = await getUserProfile();

  if (!profile) {
    redirect('/onboarding');
  }

  const [drives, applications] = await Promise.all([
    getOpenDrives().catch(() => []),
    getMyApplications().catch(() => []),
  ]);

  return (
    <DashboardContent 
      profile={profile} 
      drives={drives} 
      applications={applications}
      isAdmin={session.role === 'admin'}
    />
  );
}
