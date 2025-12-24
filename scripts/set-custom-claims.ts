import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
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

type UserRole = 'admin' | 'tpo' | 'student';

interface ClaimArgs {
  uid: string;
  role: UserRole;
  programCode?: string;
}

function parseArgs(): ClaimArgs {
  const args = process.argv.slice(2);
  const result: Partial<ClaimArgs> = {};

  for (const arg of args) {
    if (arg.startsWith('--uid=')) {
      result.uid = arg.slice(6);
    } else if (arg.startsWith('--role=')) {
      const role = arg.slice(7);
      if (!['admin', 'tpo', 'student'].includes(role)) {
        throw new Error(`Invalid role: ${role}. Must be admin, tpo, or student`);
      }
      result.role = role as UserRole;
    } else if (arg.startsWith('--program=')) {
      result.programCode = arg.slice(10);
    }
  }

  if (!result.uid) {
    throw new Error('Missing required argument: --uid');
  }

  if (!result.role) {
    throw new Error('Missing required argument: --role');
  }

  return result as ClaimArgs;
}

async function setCustomClaims(args: ClaimArgs): Promise<void> {
  console.log(`\n🔧 Setting custom claims for user: ${args.uid}`);
  console.log(`   Role: ${args.role}`);
  if (args.programCode) {
    console.log(`   Program: ${args.programCode}`);
  }

  const user = await auth.getUser(args.uid);
  console.log(`   Email: ${user.email}`);

  const claims: Record<string, string> = {
    role: args.role,
  };

  if (args.programCode) {
    claims.programCode = args.programCode;
  }
  await auth.setCustomUserClaims(args.uid, claims);

  const updatedUser = await auth.getUser(args.uid);
  console.log(`\n✅ Claims set successfully!`);
  console.log(`   Current claims:`, updatedUser.customClaims);

  await auth.revokeRefreshTokens(args.uid);
  console.log(`   Refresh tokens revoked - user will need to re-login\n`);
}

async function main() {
  try {
    const args = parseArgs();
    await setCustomClaims(args);
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error);
    console.log('\nUsage:');
    console.log('  npm run set-claims -- --uid=USER_ID --role=admin|tpo|student [--program=PROGRAM_CODE]');
    console.log('\nExamples:');
    console.log('  npm run set-claims -- --uid=abc123 --role=admin');
    console.log('  npm run set-claims -- --uid=xyz789 --role=student --program=MCA_INT\n');
    process.exit(1);
  }
}

main();
