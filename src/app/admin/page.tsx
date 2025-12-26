import { redirect } from 'next/navigation';
import { getSession } from '@/actions/auth';
import { getAdminStats, getRecentActivity } from '@/actions/admin';
import { AdminDashboard } from './admin-dashboard';

export const metadata = {
  title: 'Admin Dashboard',
  description: 'Manage placement drives and students',
};

export default async function AdminPage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  // Check if user is admin
  if (session.role !== 'admin' && session.role !== 'tpo') {
    redirect('/dashboard');
  }

  // Fetch dashboard stats and recent activity
  const [statsResult, activityResult] = await Promise.all([
    getAdminStats(),
    getRecentActivity(10),
  ]);

  const stats = statsResult.stats ?? {
    activeDrives: 0,
    totalStudents: 0,
    pendingApplications: 0,
    placements: 0,
  };

  const recentActivity = activityResult.activities ?? [];

  return <AdminDashboard userRole={session.role} stats={stats} recentActivity={recentActivity} />;
}
