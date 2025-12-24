import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

if (getApps().length === 0) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const auth = getAuth();
const db = getFirestore();

type UserRole = 'admin' | 'tpo' | 'student';

interface RoleArgs {
  uid: string;
  role: UserRole;
}

function parseArgs(): RoleArgs {
  const args = process.argv.slice(2);
  const result: Partial<RoleArgs> = {};

  for (const arg of args) {
    if (arg.startsWith('--uid=')) {
      result.uid = arg.slice(6);
    } else if (arg.startsWith('--role=')) {
      const role = arg.slice(7);
      if (!['admin', 'tpo', 'student'].includes(role)) {
        throw new Error(`Invalid role: ${role}. Must be admin, tpo, or student`);
      }
      result.role = role as UserRole;
    }
  }

  if (!result.uid) {
    throw new Error('Missing required argument: --uid');
  }

  if (!result.role) {
    throw new Error('Missing required argument: --role');
  }

  return result as RoleArgs;
}

async function updateUserRole(args: RoleArgs): Promise<void> {
  console.log(`\n🔧 Updating role for user: ${args.uid}`);
  console.log(`   New role: ${args.role}`);

  const user = await auth.getUser(args.uid);
  console.log(`   Email: ${user.email}`);

  console.log('\n📝 Updating Firebase Auth custom claims...');
  await auth.setCustomUserClaims(args.uid, { role: args.role });
  console.log('   ✓ Auth claims updated');

  console.log('\n📝 Updating Firestore document...');
  const userRef = db.collection('users').doc(args.uid);
  const userDoc = await userRef.get();
  
  if (userDoc.exists) {
    await userRef.update({
      role: args.role,
      updatedAt: new Date(),
    });
    console.log('   ✓ Firestore document updated');
  } else {
    console.log('   ⚠ No Firestore document found for this user');
  }

  console.log('\n🔄 Revoking refresh tokens...');
  await auth.revokeRefreshTokens(args.uid);
  console.log('   ✓ Tokens revoked');

  const updatedUser = await auth.getUser(args.uid);
  console.log(`\n✅ Role updated successfully!`);
  console.log(`   Auth claims:`, updatedUser.customClaims);

  console.log(`\n⚠️  IMPORTANT: User must clear browser cookies and log in again!\n`);
}

async function main() {
  try {
    const args = parseArgs();
    await updateUserRole(args);
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error);
    console.log('\nUsage:');
    console.log('  pnpm update-role -- --uid=USER_ID --role=admin|tpo|student');
    console.log('\nExamples:');
    console.log('  pnpm update-role -- --uid=abc123 --role=admin');
    console.log('  pnpm update-role -- --uid=xyz789 --role=tpo\n');
    process.exit(1);
  }
}

main();