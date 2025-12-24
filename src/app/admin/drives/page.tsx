import { redirect } from 'next/navigation';
import { getSession } from '@/actions/auth';
import { getAllDrives } from '@/actions/admin';
import { DrivesManagement } from './drives-management';

export const metadata = {
  title: 'Manage Drives - Admin',
  description: 'Manage placement drives',
};

export default async function AdminDrivesPage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  if (session.role !== 'admin' && session.role !== 'tpo') {
    redirect('/dashboard');
  }

  const result = await getAllDrives();

  return <DrivesManagement drives={result.drives || []} />;
}
