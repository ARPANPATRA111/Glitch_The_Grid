import { getAnalytics } from '@/actions/admin';
import { AnalyticsDashboard } from './analytics-dashboard';

export default async function AnalyticsPage() {
  const result = await getAnalytics();
  
  return <AnalyticsDashboard analytics={result.analytics} />;
}
