import { initializeApp, cert, getApps } from 'firebase-admin/app';
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

const db = getFirestore();

const DEFAULT_COLLECTIONS = ['drives', 'applications', 'companies'];

async function deleteCollection(collectionName: string): Promise<number> {
  const collectionRef = db.collection(collectionName);
  const snapshot = await collectionRef.get();
  
  if (snapshot.empty) {
    console.log(`   📭 ${collectionName}: No documents found`);
    return 0;
  }

  const batch = db.batch();
  let count = 0;
  
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
    count++;
  });

  await batch.commit();
  console.log(`   🗑️  ${collectionName}: Deleted ${count} documents`);
  return count;
}

async function main() {
  const args = process.argv.slice(2);
  let collections = DEFAULT_COLLECTIONS;
  let includeUsers = false;

  for (const arg of args) {
    if (arg.startsWith('--collections=')) {
      collections = arg.slice(14).split(',');
    }
    if (arg === '--include-users') {
      includeUsers = true;
    }
  }

  if (includeUsers && !collections.includes('users')) {
    collections.push('users');
  }

  console.log('\n🧹 Flushing database collections...\n');
  console.log(`   Collections: ${collections.join(', ')}\n`);

  let totalDeleted = 0;
  
  for (const collection of collections) {
    const deleted = await deleteCollection(collection);
    totalDeleted += deleted;
  }

  console.log(`\n✅ Flush complete! Deleted ${totalDeleted} total documents.\n`);
  process.exit(0);
}

main().catch((error) => {
  console.error('\n❌ Error:', error);
  process.exit(1);
});
