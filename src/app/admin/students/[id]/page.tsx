import { redirect } from 'next/navigation';
import { getStudentById, getAllApplications } from '@/actions/admin';
import { StudentDetail } from './student-detail';

interface StudentPageProps {
  params: Promise<{ id: string }>;
}

export default async function StudentPage({ params }: StudentPageProps) {
  const { id } = await params;
  const [studentResult, applicationsResult] = await Promise.all([
    getStudentById(id),
    getAllApplications(),
  ]);
  
  if (!studentResult.success || !studentResult.student) {
    redirect('/admin/students');
  }

  const studentApplications = applicationsResult.success 
    ? (applicationsResult.applications || []).filter(a => a.studentId === id)
    : [];

  return <StudentDetail student={studentResult.student} applications={studentApplications} />;
}
