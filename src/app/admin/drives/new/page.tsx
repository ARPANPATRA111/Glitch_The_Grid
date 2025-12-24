import { redirect } from 'next/navigation';
import { getSession } from '@/actions/auth';
import { CreateDriveForm } from './create-drive-form';

export const metadata = {
  title: 'Create Drive - Admin',
  description: 'Create a new placement drive',
};

export default async function NewDrivePage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  if (session.role !== 'admin' && session.role !== 'tpo') {
    redirect('/dashboard');
  }

  return <CreateDriveForm />;
}
