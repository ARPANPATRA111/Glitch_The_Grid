import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
import type { 
  Application, 
  ApplicationStatus, 
  PlacementTier,
  ApplicationRoundResult 
} from '../src/types/schema';

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

interface StudentDoc {
  id: string;
  fullName: string;
  rollNumber: string;
  email: string;
  cgpa: number;
  programCode: string;
  programName: string;
  activeBacklogs: number;
  resumeUrl?: string;
  placementStatus: {
    isPlaced: boolean;
    currentTier: PlacementTier | null;
  };
}

interface DriveDoc {
  id: string;
  companyName: string;
  packageLPA: number;
  tier: PlacementTier;
  status: string;
  eligibility: {
    minCGPA: number;
    maxBacklogs?: number;
    allowedPrograms: string[];
  };
  rounds: { id: string; name: string; type: string }[];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function checkEligibility(student: StudentDoc, drive: DriveDoc): boolean {
  if (student.cgpa < drive.eligibility.minCGPA) return false;
  if (drive.eligibility.maxBacklogs !== undefined && student.activeBacklogs > drive.eligibility.maxBacklogs) return false;
  if (!drive.eligibility.allowedPrograms.includes(student.programCode)) return false;
  return true;
}

function generateApplicationStatus(drive: DriveDoc): {
  status: ApplicationStatus;
  roundResults: ApplicationRoundResult[];
  currentRound?: string;
} {
  const statuses: ApplicationStatus[] = ['applied', 'shortlisted', 'round-1', 'round-2', 'selected', 'rejected'];
  const weights = [30, 25, 15, 10, 10, 10];
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let rand = Math.random() * totalWeight;
  
  let selectedIndex = 0;
  for (let i = 0; i < weights.length; i++) {
    rand -= weights[i]!;
    if (rand <= 0) {
      selectedIndex = i;
      break;
    }
  }
  
  const status = statuses[selectedIndex]!;
  const roundResults: ApplicationRoundResult[] = [];
  
  if (drive.rounds && drive.rounds.length > 0) {
    const roundIndex = ['applied', 'shortlisted', 'round-1', 'round-2', 'round-3'].indexOf(status);
    
    for (let i = 0; i < Math.min(roundIndex, drive.rounds.length); i++) {
      const round = drive.rounds[i]!;
      roundResults.push({
        roundId: round.id,
        roundName: round.name,
        status: 'passed',
        score: randomInt(60, 100),
        evaluatedAt: new Date(Date.now() - randomInt(1, 10) * 24 * 60 * 60 * 1000),
      });
    }
    
    if (status.startsWith('round-') && roundResults.length < drive.rounds.length) {
      const currentRoundIndex = roundResults.length;
      const currentRound = drive.rounds[currentRoundIndex];
      if (currentRound) {
        roundResults.push({
          roundId: currentRound.id,
          roundName: currentRound.name,
          status: 'pending',
        });
      }
    }
    if (status === 'rejected' && roundResults.length > 0) {
      const lastResult = roundResults[roundResults.length - 1];
      if (lastResult) {
        lastResult.status = 'failed';
        lastResult.score = randomInt(30, 55);
      }
    }
  }
  
  return {
    status,
    roundResults,
    currentRound: status.startsWith('round-') && drive.rounds?.[roundResults.length - 1]?.id 
      ? drive.rounds![roundResults.length - 1]!.id 
      : '',
  };
}
async function seedApplications(dryRun: boolean): Promise<void> {
  console.log(`\n📝 Generating applications...\n`);

  console.log('   📚 Fetching students...');
  const studentsSnap = await db.collection('users')
    .where('role', '==', 'student')
    .limit(200)
    .get();
  
  const students: StudentDoc[] = studentsSnap.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  } as StudentDoc));
  
  console.log(`   Found ${students.length} students`);

  console.log('   🏢 Fetching drives...');
  const drivesSnap = await db.collection('drives')
    .where('status', 'in', ['open', 'closed', 'completed', 'in-progress'])
    .limit(50)
    .get();
  
  const drives: DriveDoc[] = drivesSnap.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  } as DriveDoc));
  
  console.log(`   Found ${drives.length} drives`);

  if (students.length === 0 || drives.length === 0) {
    console.log('\n⚠️  No students or drives found. Please seed them first.\n');
    return;
  }

  let batch = db.batch();
  let batchCount = 0;
  let successCount = 0;
  const MAX_BATCH_SIZE = 400;

  const applicationsByDrive: Record<string, number> = {};
  const applicationsByStudent: Record<string, number> = {};

  for (const drive of drives) {
    const applicationRate = drive.tier === 'superDream' ? 0.6 : drive.tier === 'dream' ? 0.5 : 0.4;
    
    for (const student of students) {
      if (Math.random() > applicationRate) continue;
      if (!checkEligibility(student, drive)) continue;
      
      const studentApps = applicationsByStudent[student.id] ?? 0;
      if (studentApps >= 8) continue;
      
      if (student.placementStatus.isPlaced) {
        const tierOrder: PlacementTier[] = ['regular', 'dream', 'superDream'];
        const currentTierIndex = student.placementStatus.currentTier 
          ? tierOrder.indexOf(student.placementStatus.currentTier) 
          : -1;
        const driveTierIndex = tierOrder.indexOf(drive.tier);
        if (driveTierIndex <= currentTierIndex) continue;
      }

      try {
        const applicationId = `${drive.id}_${student.id}`;
        const { status, roundResults, currentRound } = generateApplicationStatus(drive);
        
        const appliedAt = new Date(Date.now() - randomInt(1, 30) * 24 * 60 * 60 * 1000);
        
        const application: Application = {
          id: applicationId,
          driveId: drive.id,
          studentId: student.id,
          
          studentName: student.fullName,
          studentRollNumber: student.rollNumber,
          studentEmail: student.email,
          studentCGPA: student.cgpa,
          studentProgram: student.programName,
          
          companyName: drive.companyName,
          packageLPA: drive.packageLPA,
          tier: drive.tier,
          
          status,
          currentRound: currentRound || '',
          roundResults,
          
          resumeUrl: student.resumeUrl ?? '/uploads/resumes/default.pdf',
          
          appliedAt,
          updatedAt: new Date(),
        };

        if (status === 'selected') {
          application.offerPackageLPA = drive.packageLPA;
          application.offerAccepted = Math.random() > 0.2;
          if (application.offerAccepted) {
            application.offerAcceptedAt = new Date();
          }
        }

        if (dryRun) {
          if (successCount < 10) {
            console.log(`   [DRY RUN] ${student.rollNumber} → ${drive.companyName} (${status})`);
          } else if (successCount === 10) {
            console.log(`   ... (more applications)`);
          }
        } else {
          batch.set(db.collection('applications').doc(applicationId), application);
          batchCount++;
          
          if (batchCount >= MAX_BATCH_SIZE) {
            console.log(`   💾 Committing batch of ${batchCount} applications...`);
            await batch.commit();
            batch = db.batch();
            batchCount = 0;
          }
        }

        successCount++;
        applicationsByDrive[drive.id] = (applicationsByDrive[drive.id] ?? 0) + 1;
        applicationsByStudent[student.id] = (applicationsByStudent[student.id] ?? 0) + 1;
        
      } catch (error) {
        console.log(`   ❌ Error creating application: ${error}`);
      }
    }
  }

  if (!dryRun && batchCount > 0) {
    console.log(`   💾 Committing final batch of ${batchCount} applications...`);
    await batch.commit();
  }

  if (!dryRun) {
    console.log(`   📊 Updating drive statistics...`);
    const updateBatch = db.batch();
    
    for (const [driveId, count] of Object.entries(applicationsByDrive)) {
      const driveRef = db.collection('drives').doc(driveId);
      updateBatch.update(driveRef, { 
        applicantCount: count,
        shortlistedCount: Math.floor(count * 0.4),
        selectedCount: Math.floor(count * 0.1),
      });
    }
    
    await updateBatch.commit();
  }

  // Print summary
  console.log(`\n📊 Summary:`);
  console.log(`   Total applications: ${successCount}`);
  console.log(`   Drives with applications: ${Object.keys(applicationsByDrive).length}`);
  console.log(`   Students who applied: ${Object.keys(applicationsByStudent).length}`);

  console.log(`\n✅ Created ${successCount} applications${dryRun ? ' (dry run)' : ''}\n`);
}
async function main() {
  try {
    const args = process.argv.slice(2);
    const dryRun = args.includes('--dry-run');

    await seedApplications(dryRun);
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
