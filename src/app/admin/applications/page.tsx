import { getAllApplications } from '@/actions/admin';
import { ApplicationsManagement } from './applications-management';

export default async function ApplicationsPage() {
  const result = await getAllApplications();
  
  return <ApplicationsManagement applications={result.applications || []} />;
}
