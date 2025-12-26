import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
import type { 
  PlacementDrive, 
  PlacementTier, 
  DriveStatus, 
  DriveEligibility,
  DriveRound 
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

interface CompanyData {
  name: string;
  industry: string;
  website: string;
  logo?: string;
  tier: PlacementTier;
  packageRange: { min: number; max: number }; // In LPA
  roles: Array<{
    title: string;
    description: string;
    type: 'full-time' | 'internship' | 'ppo';
  }>;
  locations: string[];
  selectionProcess: Array<{
    name: string;
    type: DriveRound['type'];
    duration: number;
    description: string;
  }>;
}

const COMPANIES: CompanyData[] = [
  {
    name: 'TCS (Tata Consultancy Services)',
    industry: 'IT Services & Consulting',
    website: 'https://www.tcs.com',
    tier: 'regular',
    packageRange: { min: 3.36, max: 4.5 },
    roles: [
      { title: 'System Engineer', description: 'Work on enterprise software solutions, participate in SDLC, and develop applications using modern technologies.', type: 'full-time' },
      { title: 'Assistant System Engineer', description: 'Entry-level role focusing on software development and maintenance under guidance of senior engineers.', type: 'full-time' },
    ],
    locations: ['Mumbai', 'Pune', 'Bangalore', 'Chennai', 'Hyderabad', 'Kolkata', 'Indore'],
    selectionProcess: [
      { name: 'TCS NQT (National Qualifier Test)', type: 'aptitude', duration: 180, description: 'Online test covering aptitude, reasoning, and programming concepts' },
      { name: 'Technical Interview', type: 'technical', duration: 45, description: 'Discussion on technical concepts, projects, and problem-solving' },
      { name: 'HR Interview', type: 'hr', duration: 20, description: 'Discussion on career goals and company fit' },
    ],
  },
  {
    name: 'Infosys',
    industry: 'IT Services & Consulting',
    website: 'https://www.infosys.com',
    tier: 'regular',
    packageRange: { min: 3.6, max: 4.5 },
    roles: [
      { title: 'Systems Engineer', description: 'Design, develop, and maintain software systems using cutting-edge technologies.', type: 'full-time' },
      { title: 'Operations Executive', description: 'Manage IT operations and ensure smooth functioning of enterprise systems.', type: 'full-time' },
    ],
    locations: ['Bangalore', 'Pune', 'Hyderabad', 'Mysore', 'Chandigarh', 'Bhubaneswar'],
    selectionProcess: [
      { name: 'InfyTQ Online Test', type: 'aptitude', duration: 150, description: 'Aptitude, logical reasoning, and verbal ability assessment' },
      { name: 'Technical + HR Interview', type: 'technical', duration: 60, description: 'Combined technical and HR discussion' },
    ],
  },
  {
    name: 'Wipro',
    industry: 'IT Services & Consulting',
    website: 'https://www.wipro.com',
    tier: 'regular',
    packageRange: { min: 3.5, max: 4.0 },
    roles: [
      { title: 'Project Engineer', description: 'Contribute to software development projects and collaborate with cross-functional teams.', type: 'full-time' },
      { title: 'Graduate Engineer Trainee', description: 'Training program followed by placement in various technology domains.', type: 'full-time' },
    ],
    locations: ['Bangalore', 'Chennai', 'Hyderabad', 'Pune', 'Kolkata'],
    selectionProcess: [
      { name: 'Wipro NLTH', type: 'aptitude', duration: 120, description: 'National Level Talent Hunt - online assessment' },
      { name: 'Technical Interview', type: 'technical', duration: 45, description: 'Technical skills evaluation' },
      { name: 'HR Interview', type: 'hr', duration: 20, description: 'Cultural fit assessment' },
    ],
  },
  {
    name: 'Cognizant',
    industry: 'IT Services & Consulting',
    website: 'https://www.cognizant.com',
    tier: 'regular',
    packageRange: { min: 4.0, max: 4.5 },
    roles: [
      { title: 'Programmer Analyst Trainee', description: 'Entry-level developer role with training in latest technologies.', type: 'full-time' },
      { title: 'GenC Intern', description: '6-month internship program with PPO opportunity.', type: 'internship' },
    ],
    locations: ['Chennai', 'Pune', 'Hyderabad', 'Bangalore', 'Kolkata'],
    selectionProcess: [
      { name: 'CTS Online Assessment', type: 'aptitude', duration: 120, description: 'Quantitative, logical, and verbal aptitude test' },
      { name: 'Coding Round', type: 'coding', duration: 60, description: 'Programming problems in preferred language' },
      { name: 'Technical + HR Interview', type: 'technical', duration: 45, description: 'Combined interview round' },
    ],
  },
  {
    name: 'Tech Mahindra',
    industry: 'IT Services & Consulting',
    website: 'https://www.techmahindra.com',
    tier: 'regular',
    packageRange: { min: 3.25, max: 4.0 },
    roles: [
      { title: 'Associate Software Engineer', description: 'Work on software development and support projects.', type: 'full-time' },
    ],
    locations: ['Pune', 'Hyderabad', 'Chennai', 'Bangalore', 'Noida'],
    selectionProcess: [
      { name: 'Online Assessment', type: 'aptitude', duration: 90, description: 'Aptitude and technical MCQs' },
      { name: 'Technical Interview', type: 'technical', duration: 40, description: 'Core technical concepts discussion' },
      { name: 'HR Round', type: 'hr', duration: 15, description: 'HR discussion' },
    ],
  },
  {
    name: 'Capgemini',
    industry: 'IT Services & Consulting',
    website: 'https://www.capgemini.com',
    tier: 'regular',
    packageRange: { min: 4.0, max: 5.0 },
    roles: [
      { title: 'Analyst', description: 'Business and technology analyst role working with global clients.', type: 'full-time' },
      { title: 'Senior Analyst', description: 'Lead analyst role for high performers.', type: 'full-time' },
    ],
    locations: ['Mumbai', 'Pune', 'Bangalore', 'Chennai', 'Hyderabad', 'Kolkata'],
    selectionProcess: [
      { name: 'Game-Based Assessment', type: 'aptitude', duration: 45, description: 'Interactive game-based aptitude evaluation' },
      { name: 'Coding Challenge', type: 'coding', duration: 90, description: 'Programming problems assessment' },
      { name: 'Technical + Behavioral Interview', type: 'technical', duration: 60, description: 'Combined assessment' },
    ],
  },

  {
    name: 'Accenture',
    industry: 'Consulting & Technology',
    website: 'https://www.accenture.com',
    tier: 'dream',
    packageRange: { min: 5.0, max: 8.0 },
    roles: [
      { title: 'Associate Software Engineer', description: 'Work on digital transformation projects using latest technologies.', type: 'full-time' },
      { title: 'Application Development Analyst', description: 'Develop and maintain enterprise applications.', type: 'full-time' },
    ],
    locations: ['Mumbai', 'Bangalore', 'Pune', 'Chennai', 'Hyderabad', 'Gurgaon'],
    selectionProcess: [
      { name: 'Cognitive & Technical Assessment', type: 'aptitude', duration: 120, description: 'Online assessment testing cognitive abilities and technical knowledge' },
      { name: 'Coding Round', type: 'coding', duration: 60, description: 'DSA problems' },
      { name: 'Technical Interview', type: 'technical', duration: 45, description: 'In-depth technical discussion' },
      { name: 'HR Interview', type: 'hr', duration: 30, description: 'Behavioral and HR round' },
    ],
  },
  {
    name: 'IBM',
    industry: 'Technology & Consulting',
    website: 'https://www.ibm.com',
    tier: 'dream',
    packageRange: { min: 5.5, max: 9.0 },
    roles: [
      { title: 'Associate System Engineer', description: 'Work on cloud, AI, and enterprise solutions.', type: 'full-time' },
      { title: 'Package Consultant', description: 'SAP and ERP implementation roles.', type: 'full-time' },
    ],
    locations: ['Bangalore', 'Hyderabad', 'Pune', 'Delhi NCR', 'Kolkata'],
    selectionProcess: [
      { name: 'IBM Cognitive Ability Test', type: 'aptitude', duration: 60, description: 'Aptitude and reasoning assessment' },
      { name: 'Coding Assessment', type: 'coding', duration: 90, description: 'HackerRank-based coding test' },
      { name: 'Technical Interview', type: 'technical', duration: 60, description: 'Technical deep-dive' },
      { name: 'HR Interview', type: 'hr', duration: 30, description: 'Final HR discussion' },
    ],
  },
  {
    name: 'Deloitte',
    industry: 'Professional Services',
    website: 'https://www.deloitte.com',
    tier: 'dream',
    packageRange: { min: 7.0, max: 12.0 },
    roles: [
      { title: 'Analyst', description: 'Business and technology consulting roles.', type: 'full-time' },
      { title: 'Technology Analyst', description: 'Focus on digital and technology transformation.', type: 'full-time' },
    ],
    locations: ['Mumbai', 'Bangalore', 'Delhi', 'Hyderabad', 'Chennai', 'Pune'],
    selectionProcess: [
      { name: 'Versant Test', type: 'other', duration: 30, description: 'English communication assessment' },
      { name: 'Online Assessment', type: 'aptitude', duration: 90, description: 'Aptitude and technical MCQs' },
      { name: 'Group Discussion', type: 'gd', duration: 30, description: 'Topic-based group discussion' },
      { name: 'Case Study Interview', type: 'case-study', duration: 60, description: 'Business case analysis' },
      { name: 'HR Interview', type: 'hr', duration: 30, description: 'Final HR round' },
    ],
  },
  {
    name: 'ZS Associates',
    industry: 'Consulting & Analytics',
    website: 'https://www.zs.com',
    tier: 'dream',
    packageRange: { min: 8.0, max: 12.0 },
    roles: [
      { title: 'Decision Analytics Associate', description: 'Work on data-driven business solutions for pharma and healthcare.', type: 'full-time' },
      { title: 'Business Technology Solutions Associate', description: 'Technology consulting and implementation.', type: 'full-time' },
    ],
    locations: ['Pune', 'Delhi NCR', 'Bangalore'],
    selectionProcess: [
      { name: 'Online Aptitude Test', type: 'aptitude', duration: 90, description: 'Quant, logical, and verbal assessment' },
      { name: 'Case Interview Round 1', type: 'case-study', duration: 45, description: 'Business problem-solving' },
      { name: 'Case Interview Round 2', type: 'case-study', duration: 45, description: 'Advanced case analysis' },
      { name: 'HR Interview', type: 'hr', duration: 30, description: 'Cultural fit assessment' },
    ],
  },
  {
    name: 'Jio Platforms',
    industry: 'Telecommunications & Technology',
    website: 'https://www.jio.com',
    tier: 'dream',
    packageRange: { min: 6.5, max: 10.0 },
    roles: [
      { title: 'Software Developer', description: 'Build next-gen telecom and digital solutions.', type: 'full-time' },
      { title: 'Network Engineer', description: 'Work on 5G and network infrastructure.', type: 'full-time' },
    ],
    locations: ['Mumbai', 'Navi Mumbai', 'Bangalore', 'Hyderabad'],
    selectionProcess: [
      { name: 'Online Assessment', type: 'aptitude', duration: 90, description: 'Aptitude and programming MCQs' },
      { name: 'Coding Round', type: 'coding', duration: 60, description: 'Data structures and algorithms' },
      { name: 'Technical Interview', type: 'technical', duration: 60, description: 'System design and coding' },
      { name: 'HR Interview', type: 'hr', duration: 30, description: 'Final discussion' },
    ],
  },

  {
    name: 'Microsoft',
    industry: 'Technology',
    website: 'https://www.microsoft.com',
    tier: 'superDream',
    packageRange: { min: 18.0, max: 25.0 },
    roles: [
      { title: 'Software Engineer', description: 'Build products used by billions worldwide - Azure, Office, Windows, etc.', type: 'full-time' },
      { title: 'Program Manager', description: 'Define product roadmap and work with engineering teams.', type: 'full-time' },
    ],
    locations: ['Hyderabad', 'Bangalore', 'Noida'],
    selectionProcess: [
      { name: 'Online Coding Assessment', type: 'coding', duration: 90, description: 'DSA problems on Codility platform' },
      { name: 'Technical Interview 1', type: 'technical', duration: 60, description: 'DSA and problem-solving' },
      { name: 'Technical Interview 2', type: 'technical', duration: 60, description: 'System design discussion' },
      { name: 'Hiring Manager Interview', type: 'technical', duration: 45, description: 'Technical + behavioral assessment' },
      { name: 'HR Interview', type: 'hr', duration: 30, description: 'Final HR round' },
    ],
  },
  {
    name: 'Google',
    industry: 'Technology',
    website: 'https://www.google.com',
    tier: 'superDream',
    packageRange: { min: 25.0, max: 40.0 },
    roles: [
      { title: 'Software Engineer L3', description: 'Work on Google Search, Cloud, or Android products.', type: 'full-time' },
    ],
    locations: ['Bangalore', 'Hyderabad', 'Gurgaon'],
    selectionProcess: [
      { name: 'Online Coding Test', type: 'coding', duration: 90, description: 'Algorithmic problems' },
      { name: 'Phone Screen', type: 'technical', duration: 45, description: 'Coding interview via video call' },
      { name: 'On-site Interview 1', type: 'technical', duration: 45, description: 'DSA problem-solving' },
      { name: 'On-site Interview 2', type: 'technical', duration: 45, description: 'System design' },
      { name: 'On-site Interview 3', type: 'technical', duration: 45, description: 'Googleyness & Leadership' },
    ],
  },
  {
    name: 'Amazon',
    industry: 'E-Commerce & Cloud Computing',
    website: 'https://www.amazon.com',
    tier: 'superDream',
    packageRange: { min: 16.0, max: 30.0 },
    roles: [
      { title: 'SDE-1 (Software Development Engineer)', description: 'Build scalable systems for Amazon retail, AWS, or Alexa.', type: 'full-time' },
      { title: 'Business Analyst', description: 'Drive data-informed business decisions.', type: 'full-time' },
    ],
    locations: ['Bangalore', 'Hyderabad', 'Chennai', 'Delhi NCR'],
    selectionProcess: [
      { name: 'Online Assessment', type: 'coding', duration: 120, description: 'Coding + Work Simulation' },
      { name: 'Technical Interview 1', type: 'technical', duration: 60, description: 'DSA with Leadership Principles' },
      { name: 'Technical Interview 2', type: 'technical', duration: 60, description: 'System design and LLD' },
      { name: 'Bar Raiser Interview', type: 'technical', duration: 60, description: 'Comprehensive assessment' },
    ],
  },
  {
    name: 'Goldman Sachs',
    industry: 'Investment Banking & Financial Services',
    website: 'https://www.goldmansachs.com',
    tier: 'superDream',
    packageRange: { min: 18.0, max: 28.0 },
    roles: [
      { title: 'Analyst - Engineering', description: 'Build trading platforms and financial technology solutions.', type: 'full-time' },
      { title: 'Summer Analyst (Internship)', description: '10-week summer internship with PPO.', type: 'internship' },
    ],
    locations: ['Bangalore', 'Mumbai'],
    selectionProcess: [
      { name: 'HackerRank Test', type: 'coding', duration: 120, description: 'Coding and problem-solving' },
      { name: 'Technical Interview 1', type: 'technical', duration: 60, description: 'DSA deep-dive' },
      { name: 'Technical Interview 2', type: 'technical', duration: 60, description: 'CS fundamentals and system design' },
      { name: 'Hirevue Interview', type: 'hr', duration: 30, description: 'Video-based behavioral assessment' },
    ],
  },
  {
    name: 'Adobe',
    industry: 'Software & Digital Media',
    website: 'https://www.adobe.com',
    tier: 'superDream',
    packageRange: { min: 18.0, max: 26.0 },
    roles: [
      { title: 'Member of Technical Staff', description: 'Work on Creative Cloud, Document Cloud, or Experience Cloud products.', type: 'full-time' },
      { title: 'Research Engineer', description: 'AI/ML research for Adobe products.', type: 'full-time' },
    ],
    locations: ['Noida', 'Bangalore'],
    selectionProcess: [
      { name: 'Online Coding Test', type: 'coding', duration: 90, description: 'HackerRank coding assessment' },
      { name: 'Technical Interview 1', type: 'technical', duration: 60, description: 'Problem-solving and coding' },
      { name: 'Technical Interview 2', type: 'technical', duration: 60, description: 'System design and projects' },
      { name: 'Hiring Manager Round', type: 'technical', duration: 45, description: 'Final technical discussion' },
      { name: 'HR Interview', type: 'hr', duration: 30, description: 'Cultural fit' },
    ],
  },
  {
    name: 'Atlassian',
    industry: 'Enterprise Software',
    website: 'https://www.atlassian.com',
    tier: 'superDream',
    packageRange: { min: 25.0, max: 35.0 },
    roles: [
      { title: 'Software Engineer', description: 'Build products like Jira, Confluence, and Trello used by millions.', type: 'full-time' },
    ],
    locations: ['Bangalore'],
    selectionProcess: [
      { name: 'Karat Interview', type: 'coding', duration: 60, description: 'Live coding assessment' },
      { name: 'Technical Interview 1', type: 'technical', duration: 60, description: 'DSA and coding' },
      { name: 'Technical Interview 2', type: 'technical', duration: 60, description: 'System design' },
      { name: 'Values Interview', type: 'hr', duration: 45, description: 'Atlassian values assessment' },
    ],
  },
  {
    name: 'Uber',
    industry: 'Transportation Technology',
    website: 'https://www.uber.com',
    tier: 'superDream',
    packageRange: { min: 22.0, max: 32.0 },
    roles: [
      { title: 'Software Engineer II', description: 'Build ride-sharing and food delivery platform features.', type: 'full-time' },
    ],
    locations: ['Bangalore', 'Hyderabad'],
    selectionProcess: [
      { name: 'Phone Screen', type: 'technical', duration: 45, description: 'Initial coding assessment' },
      { name: 'Virtual Onsite - Coding 1', type: 'coding', duration: 60, description: 'DSA problem' },
      { name: 'Virtual Onsite - Coding 2', type: 'coding', duration: 60, description: 'DSA problem' },
      { name: 'Virtual Onsite - System Design', type: 'technical', duration: 60, description: 'System design discussion' },
      { name: 'Behavioral Interview', type: 'hr', duration: 45, description: 'Cultural and behavioral assessment' },
    ],
  },
  {
    name: 'PayPal',
    industry: 'FinTech & Digital Payments',
    website: 'https://www.paypal.com',
    tier: 'superDream',
    packageRange: { min: 15.0, max: 22.0 },
    roles: [
      { title: 'Software Engineer 1', description: 'Build secure payment solutions and digital wallet features.', type: 'full-time' },
      { title: 'Data Scientist', description: 'Apply ML to fraud detection and customer insights.', type: 'full-time' },
    ],
    locations: ['Bangalore', 'Chennai'],
    selectionProcess: [
      { name: 'Online Assessment', type: 'coding', duration: 90, description: 'Coding problems on HackerRank' },
      { name: 'Technical Interview 1', type: 'technical', duration: 60, description: 'DSA and problem-solving' },
      { name: 'Technical Interview 2', type: 'technical', duration: 60, description: 'Projects and system design' },
      { name: 'HR Interview', type: 'hr', duration: 30, description: 'Final discussion' },
    ],
  },
];

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function generateDriveId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `drive_${timestamp}_${random}`;
}

function generateDrive(company: CompanyData, daysOffset: number): Omit<PlacementDrive, 'id'> {
  const role = randomElement(company.roles);
  const packageLPA = Number(randomBetween(company.packageRange.min, company.packageRange.max).toFixed(2));
  
  const now = new Date();
  const applicationDeadline = new Date(now.getTime() + daysOffset * 24 * 60 * 60 * 1000);
  const driveDate = new Date(applicationDeadline.getTime() + 5 * 24 * 60 * 60 * 1000);
  
  let status: DriveStatus;
  if (daysOffset < -5) {
    status = 'completed';
  } else if (daysOffset < 0) {
    status = 'closed';
  } else if (daysOffset <= 7) {
    status = 'open';
  } else {
    status = 'upcoming';
  }

  const eligibility: DriveEligibility = {
    minCGPA: company.tier === 'superDream' ? 7.5 : company.tier === 'dream' ? 7.0 : 6.0,
    maxBacklogs: company.tier === 'superDream' ? 0 : company.tier === 'dream' ? 0 : 1,
    // Use correct IIPS program codes from roll-parser.ts
    allowedPrograms: company.tier === 'superDream' 
      ? ['MCA_INT', 'MTECH_IT']
      : ['MCA_INT', 'MBA_MS', 'MTECH_IT', 'MBA_APR', 'MBA_ENT', 'BCOM_HONS'],
    allowedBatches: ['2023-2029', '2024-2030', '2022-2028'],
    minTenthPercent: company.tier === 'superDream' ? 70 : 60,
    minTwelfthPercent: company.tier === 'superDream' ? 70 : 60,
  };

  const rounds: DriveRound[] = company.selectionProcess.map((round, index) => ({
    id: `round_${index + 1}`,
    name: round.name,
    type: round.type,
    duration: round.duration,
    description: round.description,
    isOnline: index === 0,
  }));

  return {
    companyId: company.name.toLowerCase().replace(/[^a-z0-9]/g, '_'),
    companyName: company.name,
    companyLogo: company.logo ?? '',
    industry: company.industry,
    website: company.website,
    
    jobTitle: role.title,
    jobDescription: role.description,
    jobType: role.type,
    workLocation: randomElement(company.locations),
    isRemote: Math.random() > 0.7, 
    
    tier: company.tier,
    packageLPA,
    packageBreakdown: company.tier === 'superDream' ? {
      baseSalary: packageLPA * 0.7,
      bonus: packageLPA * 0.15,
      stocks: packageLPA * 0.1,
      other: packageLPA * 0.05,
    } : {
      baseSalary: packageLPA * 0.85,
      bonus: packageLPA * 0.15,
    },
    stipendPerMonth: role.type === 'internship' ? Math.floor(packageLPA * 100000 / 12 * 0.8 / 1000) * 1000 : 0,
    
    eligibility,
    rounds,
    
    applicationDeadline,
    driveDate,
    
    status,
    
    applicantCount: status === 'completed' ? Math.floor(Math.random() * 200) + 50 : 0,
    shortlistedCount: status === 'completed' ? Math.floor(Math.random() * 50) + 10 : 0,
    selectedCount: status === 'completed' ? Math.floor(Math.random() * 10) + 1 : 0,
    
    documents: [],
    
    createdBy: 'system',
    createdAt: new Date(),
    updatedAt: new Date(),
    publishedAt: new Date(),
  };
}

async function seedDrives(count: number, dryRun: boolean): Promise<void> {
  console.log(`\n🏢 Generating ${count} realistic placement drives\n`);

  const batch = db.batch();
  let successCount = 0;

  const timeOffsets: number[] = [];
  for (let i = 0; i < count; i++) {
    const offset = Math.floor(-10 + (30 * i / count));
    timeOffsets.push(offset);
  }

  const shuffledCompanies = [...COMPANIES].sort(() => Math.random() - 0.5);

  for (let i = 0; i < count; i++) {
    const company = shuffledCompanies[i % shuffledCompanies.length]!;
    const daysOffset = timeOffsets[i]!;
    
    try {
      const drive = generateDrive(company, daysOffset);
      const driveId = generateDriveId();

      if (dryRun) {
        const statusEmoji = drive.status === 'open' ? '🟢' : drive.status === 'upcoming' ? '🟡' : '⚪';
        console.log(`   ${statusEmoji} ${drive.companyName.padEnd(35)} | ${drive.jobTitle.padEnd(30)} | ₹${drive.packageLPA.toFixed(1)} LPA | ${drive.tier}`);
      } else {
        batch.set(db.collection('drives').doc(driveId), drive);
      }
      
      successCount++;
    } catch (error) {
      console.log(`   ❌ Error generating drive ${i + 1}: ${error}`);
    }
  }

  if (!dryRun) {
    console.log(`   💾 Committing ${successCount} drives to database...`);
    await batch.commit();
  }

  console.log(`\n📊 Summary by Tier:`);
  const tierCounts = { regular: 0, dream: 0, superDream: 0 };
  for (let i = 0; i < Math.min(count, shuffledCompanies.length); i++) {
    tierCounts[shuffledCompanies[i]!.tier]++;
  }
  console.log(`   Regular: ${tierCounts.regular} drives`);
  console.log(`   Dream: ${tierCounts.dream} drives`);
  console.log(`   Super Dream: ${tierCounts.superDream} drives`);

  console.log(`\n✅ Created ${successCount} placement drives${dryRun ? ' (dry run)' : ''}\n`);
}

async function main() {
  try {
    const args = process.argv.slice(2);
    let count = 15;
    let dryRun = false;

    for (const arg of args) {
      if (arg.startsWith('--count=')) {
        count = parseInt(arg.slice(8), 10);
      } else if (arg === '--dry-run') {
        dryRun = true;
      }
    }

    if (count <= 0) {
      console.log('\n📚 Seed Drives Script');
      console.log('======================\n');
      console.log('Usage:');
      console.log('  pnpm seed:drives -- --count=15');
      console.log('  pnpm seed:drives -- --count=20 --dry-run\n');
      console.log('Options:');
      console.log('  --count=N     Generate N drives (default: 15)');
      console.log('  --dry-run     Preview without writing to database\n');
    } else {
      await seedDrives(count, dryRun);
    }

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
