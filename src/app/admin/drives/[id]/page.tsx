import { redirect, notFound } from 'next/navigation';
import { getSession } from '@/actions/auth';
import { getDriveById, getAllApplications } from '@/actions/admin';
import { EditDriveForm } from './edit-drive-form';

export const metadata = {
  title: 'Edit Drive - Admin',
  description: 'Edit placement drive',
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditDrivePage({ params }: Props) {
  const { id } = await params;
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  if (session.role !== 'admin' && session.role !== 'tpo') {
    redirect('/dashboard');
  }

  const [driveResult, applicationsResult] = await Promise.all([
    getDriveById(id),
    getAllApplications({ driveId: id }),
  ]);

  if (!driveResult.success || !driveResult.drive) {
    notFound();
  }

  return (
    <EditDriveForm 
      drive={driveResult.drive} 
      applications={applicationsResult.applications || []}
    />
  );
}
