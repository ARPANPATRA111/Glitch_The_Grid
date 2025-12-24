import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
import { parseRollNumber, type ProgramPrefix } from '../src/lib/iips/roll-parser';
import type { UserProfile, PlacementStatus, UserRole, Gender } from '../src/types/schema';

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

const MALE_FIRST_NAMES = [
  'Aarav', 'Aditya', 'Akash', 'Amit', 'Ankit', 'Arjun', 'Aryan', 'Ayush',
  'Bhavesh', 'Chirag', 'Deepak', 'Dev', 'Gaurav', 'Harsh', 'Himanshu', 'Ishaan',
  'Jayesh', 'Karan', 'Kartik', 'Krishna', 'Kunal', 'Lakshya', 'Manish', 'Mayank',
  'Mohit', 'Nakul', 'Nikhil', 'Omkar', 'Pranav', 'Prashant', 'Rahul', 'Rajat',
  'Ravi', 'Rishabh', 'Rohan', 'Rohit', 'Sagar', 'Sahil', 'Sandeep', 'Sanjay',
  'Shivam', 'Shreyas', 'Shubham', 'Siddharth', 'Sumit', 'Suraj', 'Tanmay', 'Tushar',
  'Vaibhav', 'Varun', 'Vedant', 'Vijay', 'Vikram', 'Vinay', 'Vivek', 'Yash',
];

const FEMALE_FIRST_NAMES = [
  'Aanchal', 'Aditi', 'Akanksha', 'Ananya', 'Anjali', 'Anushka', 'Bhavya', 'Charu',
  'Deepika', 'Diya', 'Divya', 'Gayatri', 'Harshita', 'Ishita', 'Jaya', 'Kajal',
  'Kavya', 'Khushi', 'Kriti', 'Lavanya', 'Mansi', 'Meera', 'Muskan', 'Nandini',
  'Neha', 'Nidhi', 'Pallavi', 'Pooja', 'Prachi', 'Pragya', 'Priyanka', 'Rashi',
  'Rhea', 'Riya', 'Sakshi', 'Saloni', 'Sanjana', 'Shikha', 'Shraddha', 'Shreya',
  'Shruti', 'Simran', 'Sneha', 'Sonali', 'Swati', 'Tanvi', 'Tanya', 'Trisha',
  'Vanshika', 'Vaishali', 'Vidhi', 'Vidya', 'Yashika', 'Zara',
];

const LAST_NAMES = [
  'Agarwal', 'Bansal', 'Chauhan', 'Garg', 'Goyal', 'Gupta', 'Jain', 'Kapoor',
  'Khanna', 'Kumar', 'Malhotra', 'Mehra', 'Mittal', 'Sharma', 'Singh', 'Singhal',
  'Sinha', 'Tiwari', 'Tripathi', 'Verma',
  'Deshmukh', 'Joshi', 'Kulkarni', 'Patil', 'Pawar',
  'Iyer', 'Menon', 'Nair', 'Pillai', 'Rao', 'Reddy', 'Subramanian',
  'Bhatnagar', 'Dubey', 'Dwivedi', 'Mishra', 'Pandey', 'Rajput', 'Saxena',
  'Shrivastava', 'Shukla', 'Thakur', 'Yadav',
];

const MP_CITIES = [
  { city: 'Indore', pincodes: ['452001', '452002', '452003', '452010', '452014'] },
  { city: 'Bhopal', pincodes: ['462001', '462011', '462016', '462023', '462030'] },
  { city: 'Ujjain', pincodes: ['456001', '456006', '456010'] },
  { city: 'Dewas', pincodes: ['455001', '455111'] },
  { city: 'Ratlam', pincodes: ['457001'] },
  { city: 'Jabalpur', pincodes: ['482001', '482002', '482003'] },
  { city: 'Gwalior', pincodes: ['474001', '474002', '474009'] },
];

const LOCALITIES = [
  'Vijay Nagar', 'MG Road', 'Sapna Sangeeta', 'Palasia', 'Rajwada', 
  'AB Road', 'Nehru Nagar', 'Gandhi Nagar', 'Scheme No. 54', 'Scheme No. 78',
  'South Tukoganj', 'New Palasia', 'Rau', 'Bhawarkua', 'Khandwa Road',
  'Ring Road', 'Bengali Square', 'Airport Road', 'LIG Colony', 'MIG Colony',
];

const BOARDS = ['CBSE', 'MP Board', 'ICSE'];

const TECH_SKILLS = [
  'Java', 'Python', 'C++', 'JavaScript', 'TypeScript', 'React', 'Angular',
  'Node.js', 'SQL', 'MongoDB', 'HTML', 'CSS', 'Git', 'Docker', 'AWS',
  'Machine Learning', 'Data Science', 'Flutter', 'React Native', 'Spring Boot',
];

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function randomInt(min: number, max: number): number {
  return Math.floor(randomBetween(min, max + 1));
}

function generatePhone(): string {
  const prefixes = ['98', '99', '70', '73', '74', '75', '76', '77', '78', '79', '80', '81', '82', '83', '84', '85', '86', '87', '88', '89'];
  return `+91${randomElement(prefixes)}${randomInt(10000000, 99999999)}`;
}

function generateDateOfBirth(admissionYear: number): Date {
  const birthYear = admissionYear - randomInt(17, 20);
  const month = randomInt(1, 12);
  const day = randomInt(1, 28);
  return new Date(birthYear, month - 1, day);
}

function generateEmail(firstName: string, lastName: string, rollNumber: string): string {
  const formats = [
    () => `${firstName.toLowerCase()}.${lastName.toLowerCase()}@iips.edu.in`,
    () => `${firstName.toLowerCase()}${lastName.toLowerCase().charAt(0)}@iips.edu.in`,
    () => `${rollNumber.toLowerCase().replace(/-/g, '')}@iips.edu.in`,
    () => `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randomInt(1, 99)}@gmail.com`,
  ];
  return randomElement(formats)();
}

function generateAddress(): { line1: string; line2: string; city: string; state: string; pincode: string } {
  const cityData = randomElement(MP_CITIES);
  const houseNo = randomInt(1, 500);
  const locality = randomElement(LOCALITIES);
  
  return {
    line1: `${houseNo}, ${locality}`,
    line2: Math.random() > 0.5 ? `Near ${randomElement(['Main Road', 'Bus Stand', 'Railway Station', 'Market', 'School', 'Temple'])}` : '',
    city: cityData.city,
    state: 'Madhya Pradesh',
    pincode: randomElement(cityData.pincodes),
  };
}

function generateSkills(): string[] {
  const count = randomInt(3, 8);
  const shuffled = [...TECH_SKILLS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function generateStudent(index: number, prefix: ProgramPrefix, year: number): Partial<UserProfile> {
  const isMale = Math.random() > 0.45; 
  const gender: Gender = isMale ? 'male' : 'female';
  
  const firstName = isMale ? randomElement(MALE_FIRST_NAMES) : randomElement(FEMALE_FIRST_NAMES);
  const lastName = randomElement(LAST_NAMES);
  
  const paddedIndex = String(index).padStart(2, '0');
  const rollNumber = `${prefix}-2K${year.toString().slice(-2)}-${paddedIndex}`;
  const rollResult = parseRollNumber(rollNumber);
  
  if (!rollResult.success) {
    throw new Error(`Invalid generated roll number: ${rollNumber}`);
  }

  const rollData = rollResult.data;
  
  let cgpa: number;
  const rand = Math.random();
  if (rand < 0.05) cgpa = randomBetween(5.5, 6.5);
  else if (rand < 0.20) cgpa = randomBetween(6.5, 7.0);
  else if (rand < 0.50) cgpa = randomBetween(7.0, 8.0);
  else if (rand < 0.80) cgpa = randomBetween(8.0, 8.5);
  else if (rand < 0.95) cgpa = randomBetween(8.5, 9.0);
  else cgpa = randomBetween(9.0, 9.8);
  
  let activeBacklogs = 0;
  let totalBacklogs = 0;
  if (cgpa < 6.5) {
    activeBacklogs = Math.random() > 0.5 ? randomInt(1, 3) : 0;
    totalBacklogs = activeBacklogs + randomInt(0, 2);
  } else if (cgpa < 7.0) {
    activeBacklogs = Math.random() > 0.8 ? 1 : 0;
    totalBacklogs = activeBacklogs + (Math.random() > 0.7 ? 1 : 0);
  }

  const placementStatus: PlacementStatus = {
    isPlaced: false,
    currentTier: null,
    offers: [],
    isDebarred: false,
  };

  const email = generateEmail(firstName, lastName, rollData.rollNumber);
  
  return {
    fullName: `${firstName} ${lastName}`,
    rollNumber: rollData.rollNumber,
    email,
    emailVerified: true,
    gender,
    dateOfBirth: generateDateOfBirth(rollData.admissionYear),
    phone: generatePhone(),
    
    address: generateAddress(),

    programCode: rollData.programCode,
    programName: rollData.programName,
    department: rollData.department,
    admissionYear: rollData.admissionYear,
    passingYear: rollData.passingYear,
    batch: rollData.batch,
    currentYear: rollData.currentYear,
    isLateralEntry: rollData.isLateralEntry,

    cgpa: Number(cgpa.toFixed(2)),
    activeBacklogs,
    totalBacklogs,

    tenthPercentage: Number(randomBetween(65, 95).toFixed(1)),
    tenthBoard: randomElement(BOARDS),
    tenthYear: rollData.admissionYear - 4,
    twelfthPercentage: Number(randomBetween(60, 92).toFixed(1)),
    twelfthBoard: randomElement(BOARDS),
    twelfthYear: rollData.admissionYear - 2,

    skills: generateSkills(),
    
    placementStatus,
    appliedDrives: [],

    profileCompletionPercent: 100,
    isProfileComplete: true,

    role: 'student' as UserRole,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}
async function seedStudents(count: number, dryRun: boolean): Promise<void> {
  console.log(`\n🎓 Generating ${count} realistic IIPS students\n`);

  const programDistribution: { prefix: ProgramPrefix; weight: number }[] = [
    { prefix: 'IC', weight: 40 },
    { prefix: 'IM', weight: 30 },  
    { prefix: 'IT', weight: 20 }, 
    { prefix: 'BC', weight: 10 }, 
  ];

  const totalWeight = programDistribution.reduce((sum, p) => sum + p.weight, 0);
  
  const currentYear = new Date().getFullYear();
  const years = [currentYear - 1, currentYear - 2, currentYear - 3];

  let successCount = 0;
  let batch = db.batch();
  let batchCount = 0;
  const MAX_BATCH_SIZE = 400;

  const studentsByProgram: Record<string, number> = {};

  for (let i = 0; i < count; i++) {
    let rand = Math.random() * totalWeight;
    let selectedPrefix: ProgramPrefix = 'IC';
    
    for (const prog of programDistribution) {
      rand -= prog.weight;
      if (rand <= 0) {
        selectedPrefix = prog.prefix;
        break;
      }
    }

    const year = randomElement(years);
    const programKey = `${selectedPrefix}_${year}`;
    
    studentsByProgram[programKey] = (studentsByProgram[programKey] ?? 0) + 1;
    const studentIndex = studentsByProgram[programKey]!;
    
    try {
      const student = generateStudent(studentIndex, selectedPrefix, year);
      const uid = `student_${student.rollNumber!.replace(/[^a-zA-Z0-9]/g, '_')}`;
      
      student.uid = uid;

      if (dryRun) {
        if (i < 10 || i === count - 1) {
          console.log(`   [DRY RUN] ${student.fullName} | ${student.rollNumber} | ${student.email} | CGPA: ${student.cgpa}`);
        } else if (i === 10) {
          console.log(`   ... (${count - 11} more students)`);
        }
      } else {
        batch.set(db.collection('users').doc(uid), student);
        batchCount++;
        
        if (batchCount >= MAX_BATCH_SIZE) {
          console.log(`   💾 Committing batch of ${batchCount} students...`);
          await batch.commit();
          batch = db.batch();
          batchCount = 0;
        }
      }
      
      successCount++;
    } catch (error) {
      console.log(`   ❌ Error generating student ${i + 1}: ${error}`);
    }
  }

  if (!dryRun && batchCount > 0) {
    console.log(`   💾 Committing final batch of ${batchCount} students...`);
    await batch.commit();
  }

  console.log(`\n📊 Distribution Summary:`);
  for (const [key, count] of Object.entries(studentsByProgram).sort()) {
    console.log(`   ${key}: ${count} students`);
  }

  console.log(`\n✅ Generated ${successCount} students${dryRun ? ' (dry run)' : ''}\n`);
}

async function main() {
  try {
    const args = process.argv.slice(2);
    let count = 50;
    let dryRun = false;

    for (const arg of args) {
      if (arg.startsWith('--generate=')) {
        count = parseInt(arg.slice(11), 10);
      } else if (arg === '--dry-run') {
        dryRun = true;
      }
    }

    if (count <= 0) {
      console.log('\n📚 Seed Students Script');
      console.log('========================\n');
      console.log('Usage:');
      console.log('  pnpm seed:students -- --generate=50');
      console.log('  pnpm seed:students -- --generate=100 --dry-run\n');
      console.log('Options:');
      console.log('  --generate=N     Generate N students (default: 50)');
      console.log('  --dry-run        Preview without writing to database\n');
    } else {
      await seedStudents(count, dryRun);
    }

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
