import { getAllUsers } from '@/actions/admin';
import { UsersManagement } from './users-management';

export default async function UsersPage() {
  const result = await getAllUsers();
  
  // Transform UserProfile[] to UserData[]
  const users = (result.users || []).map(user => ({
    uid: user.uid,
    email: user.email,
    displayName: user.fullName,
    role: user.role,
    createdAt: user.createdAt instanceof Date 
      ? user.createdAt.toISOString() 
      : typeof user.createdAt === 'string' 
        ? user.createdAt 
        : undefined,
  }));
  
  return <UsersManagement users={users} />;
}
