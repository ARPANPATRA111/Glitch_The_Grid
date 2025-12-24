import { redirect } from 'next/navigation';
import { getSession } from '@/actions/auth';
import { getAllStudents } from '@/actions/admin';
import { StudentsManagement } from './students-management';

export const metadata = {
  title: 'Manage Students - Admin',
  description: 'View and manage student profiles',
};

export default async function AdminStudentsPage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  if (session.role !== 'admin' && session.role !== 'tpo') {
    redirect('/dashboard');
  }

  const result = await getAllStudents();

  return <StudentsManagement students={result.students || []} />;
}
