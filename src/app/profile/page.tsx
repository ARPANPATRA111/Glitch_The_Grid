import { redirect } from 'next/navigation';
import { getSession, getUserProfile } from '@/actions/auth';
import { getMyApplications } from '@/actions/placement';
import { ProfileContent } from './profile-content';

export const metadata = {
  title: 'My Profile',
  description: 'View and edit your profile',
};

export default async function ProfilePage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  const profile = await getUserProfile();

  if (!profile) {
    redirect('/onboarding');
  }

  const applications = await getMyApplications().catch(() => []);

  return <ProfileContent profile={profile} applications={applications} />;
}
