import { getAllCompanies } from '@/actions/admin';
import { CompaniesManagement } from './companies-management';

export default async function CompaniesPage() {
  const result = await getAllCompanies();
  
  return <CompaniesManagement companies={result.companies || []} />;
}
