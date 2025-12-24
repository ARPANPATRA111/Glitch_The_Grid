import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
import type { Company } from '../src/types/schema';

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

interface CompanyTemplate {
  name: string;
  logo: string;
  website: string;
  industry: string;
  description: string;
  headquarters: string;
  avgPackage: number;
  hrContacts: { name: string; email: string; phone: string; designation: string }[];
}

const COMPANIES: CompanyTemplate[] = [
  {
    name: 'TCS (Tata Consultancy Services)',
    logo: 'https://logo.clearbit.com/tcs.com',
    website: 'https://www.tcs.com',
    industry: 'IT Services & Consulting',
    description: 'Tata Consultancy Services is an Indian multinational IT services and consulting company. It is part of the Tata Group and operates in 150 locations across 46 countries.',
    headquarters: 'Mumbai, Maharashtra',
    avgPackage: 3.8,
    hrContacts: [
      { name: 'Priya Sharma', email: 'priya.sharma@tcs.com', phone: '+91 22 6778 9000', designation: 'Campus Recruitment Lead' },
      { name: 'Rahul Verma', email: 'rahul.verma@tcs.com', phone: '+91 22 6778 9001', designation: 'HR Manager' },
    ],
  },
  {
    name: 'Infosys',
    logo: 'https://logo.clearbit.com/infosys.com',
    website: 'https://www.infosys.com',
    industry: 'IT Services & Consulting',
    description: 'Infosys is a global leader in next-generation digital services and consulting. Founded in Pune, it has become one of the largest IT companies in India.',
    headquarters: 'Bangalore, Karnataka',
    avgPackage: 4.0,
    hrContacts: [
      { name: 'Anjali Menon', email: 'anjali.menon@infosys.com', phone: '+91 80 2852 0261', designation: 'University Relations Manager' },
    ],
  },
  {
    name: 'Wipro',
    logo: 'https://logo.clearbit.com/wipro.com',
    website: 'https://www.wipro.com',
    industry: 'IT Services & Consulting',
    description: 'Wipro Limited is an Indian multinational corporation providing IT, consulting and business process services.',
    headquarters: 'Bangalore, Karnataka',
    avgPackage: 3.6,
    hrContacts: [
      { name: 'Deepak Joshi', email: 'deepak.joshi@wipro.com', phone: '+91 80 2844 0011', designation: 'Talent Acquisition Lead' },
    ],
  },
  {
    name: 'Cognizant',
    logo: 'https://logo.clearbit.com/cognizant.com',
    website: 'https://www.cognizant.com',
    industry: 'IT Services & Consulting',
    description: 'Cognizant is an American multinational IT services and consulting company. It provides business consulting, IT and outsourcing services.',
    headquarters: 'Chennai, Tamil Nadu (India HQ)',
    avgPackage: 4.2,
    hrContacts: [
      { name: 'Kavitha Rajan', email: 'kavitha.rajan@cognizant.com', phone: '+91 44 4209 6000', designation: 'Campus Hiring Manager' },
    ],
  },
  {
    name: 'Tech Mahindra',
    logo: 'https://logo.clearbit.com/techmahindra.com',
    website: 'https://www.techmahindra.com',
    industry: 'IT Services & Consulting',
    description: 'Tech Mahindra is an Indian multinational subsidiary of the Mahindra Group, providing IT services and business process outsourcing.',
    headquarters: 'Pune, Maharashtra',
    avgPackage: 3.5,
    hrContacts: [
      { name: 'Sunil Patil', email: 'sunil.patil@techmahindra.com', phone: '+91 20 6601 8100', designation: 'HR Executive' },
    ],
  },
  {
    name: 'Capgemini',
    logo: 'https://logo.clearbit.com/capgemini.com',
    website: 'https://www.capgemini.com',
    industry: 'IT Services & Consulting',
    description: 'Capgemini is a French multinational IT services and consulting company. It is one of the world\'s largest consulting firms.',
    headquarters: 'Mumbai, Maharashtra (India HQ)',
    avgPackage: 4.5,
    hrContacts: [
      { name: 'Neha Gupta', email: 'neha.gupta@capgemini.com', phone: '+91 22 6755 7000', designation: 'Recruitment Lead' },
    ],
  },
  
  {
    name: 'Accenture',
    logo: 'https://logo.clearbit.com/accenture.com',
    website: 'https://www.accenture.com',
    industry: 'Consulting & Professional Services',
    description: 'Accenture is a global professional services company providing strategy, consulting, digital, technology and operations services.',
    headquarters: 'Mumbai, Maharashtra (India HQ)',
    avgPackage: 6.5,
    hrContacts: [
      { name: 'Arun Kumar', email: 'arun.kumar@accenture.com', phone: '+91 22 6169 0000', designation: 'Campus Recruitment Director' },
      { name: 'Sneha Reddy', email: 'sneha.reddy@accenture.com', phone: '+91 22 6169 0001', designation: 'HR Business Partner' },
    ],
  },
  {
    name: 'IBM India',
    logo: 'https://logo.clearbit.com/ibm.com',
    website: 'https://www.ibm.com/in-en',
    industry: 'Technology & Consulting',
    description: 'IBM is a global technology and consulting company headquartered in Armonk, New York. IBM India is one of its largest operations worldwide.',
    headquarters: 'Bangalore, Karnataka',
    avgPackage: 7.0,
    hrContacts: [
      { name: 'Vikram Singh', email: 'vikram.singh@ibm.com', phone: '+91 80 2678 1234', designation: 'University Programs Manager' },
    ],
  },
  {
    name: 'Deloitte India',
    logo: 'https://logo.clearbit.com/deloitte.com',
    website: 'https://www2.deloitte.com/in',
    industry: 'Professional Services',
    description: 'Deloitte is one of the Big Four accounting organizations providing audit, consulting, financial advisory, risk advisory, tax and related services.',
    headquarters: 'Mumbai, Maharashtra',
    avgPackage: 8.5,
    hrContacts: [
      { name: 'Meera Nair', email: 'meera.nair@deloitte.com', phone: '+91 22 6185 4000', designation: 'Campus Relations Lead' },
    ],
  },
  {
    name: 'ZS Associates',
    logo: 'https://logo.clearbit.com/zs.com',
    website: 'https://www.zs.com',
    industry: 'Management Consulting',
    description: 'ZS is a global management consulting and technology firm focused on consulting, software, and technology services in the healthcare sector.',
    headquarters: 'Pune, Maharashtra (India HQ)',
    avgPackage: 9.5,
    hrContacts: [
      { name: 'Amit Deshmukh', email: 'amit.deshmukh@zs.com', phone: '+91 20 6630 3000', designation: 'Recruiting Manager' },
    ],
  },
  {
    name: 'Jio Platforms',
    logo: 'https://logo.clearbit.com/jio.com',
    website: 'https://www.jio.com',
    industry: 'Telecommunications & Technology',
    description: 'Jio Platforms Limited is a technology company and subsidiary of Reliance Industries. It operates Jio, India\'s largest mobile network.',
    headquarters: 'Mumbai, Maharashtra',
    avgPackage: 8.0,
    hrContacts: [
      { name: 'Pooja Shah', email: 'pooja.shah@jio.com', phone: '+91 22 3555 5000', designation: 'HR Manager - Campus' },
    ],
  },
  
  {
    name: 'Microsoft India',
    logo: 'https://logo.clearbit.com/microsoft.com',
    website: 'https://www.microsoft.com/en-in',
    industry: 'Technology',
    description: 'Microsoft Corporation is an American multinational technology corporation. Microsoft India Development Center is one of the largest R&D centers outside the US.',
    headquarters: 'Hyderabad, Telangana',
    avgPackage: 20.0,
    hrContacts: [
      { name: 'Sandeep Khanna', email: 'sandeep.khanna@microsoft.com', phone: '+91 40 6655 0000', designation: 'University Recruiting Lead' },
      { name: 'Priyanka Das', email: 'priyanka.das@microsoft.com', phone: '+91 40 6655 0001', designation: 'Talent Acquisition Partner' },
    ],
  },
  {
    name: 'Google India',
    logo: 'https://logo.clearbit.com/google.com',
    website: 'https://careers.google.com',
    industry: 'Technology',
    description: 'Google LLC is an American multinational technology company focusing on search engine technology, online advertising, cloud computing, and AI.',
    headquarters: 'Bangalore, Karnataka',
    avgPackage: 30.0,
    hrContacts: [
      { name: 'Raj Malhotra', email: 'raj.malhotra@google.com', phone: '+91 80 6799 0000', designation: 'Technical Recruiter' },
    ],
  },
  {
    name: 'Amazon India',
    logo: 'https://logo.clearbit.com/amazon.com',
    website: 'https://www.amazon.jobs/en/locations/india',
    industry: 'E-Commerce & Cloud Computing',
    description: 'Amazon.com, Inc. is an American multinational technology company. Amazon India is one of the largest e-commerce platforms in the country.',
    headquarters: 'Bangalore, Karnataka',
    avgPackage: 22.0,
    hrContacts: [
      { name: 'Kiran Rao', email: 'kiran.rao@amazon.com', phone: '+91 80 4614 1000', designation: 'University Programs Manager' },
      { name: 'Divya Sharma', email: 'divya.sharma@amazon.com', phone: '+91 80 4614 1001', designation: 'Campus Recruiter' },
    ],
  },
  {
    name: 'Goldman Sachs',
    logo: 'https://logo.clearbit.com/goldmansachs.com',
    website: 'https://www.goldmansachs.com/careers',
    industry: 'Investment Banking & Financial Services',
    description: 'The Goldman Sachs Group, Inc. is a leading global investment banking, securities and investment management firm.',
    headquarters: 'Bangalore, Karnataka',
    avgPackage: 22.0,
    hrContacts: [
      { name: 'Arjun Sinha', email: 'arjun.sinha@gs.com', phone: '+91 80 6637 0000', designation: 'Campus Recruiting Lead' },
    ],
  },
  {
    name: 'Adobe India',
    logo: 'https://logo.clearbit.com/adobe.com',
    website: 'https://www.adobe.com/in/careers',
    industry: 'Software & Digital Media',
    description: 'Adobe Inc. is an American multinational computer software company. Adobe\'s India operations are spread across Noida and Bangalore.',
    headquarters: 'Noida, Uttar Pradesh',
    avgPackage: 20.0,
    hrContacts: [
      { name: 'Nisha Kapoor', email: 'nisha.kapoor@adobe.com', phone: '+91 120 404 0000', designation: 'University Relations Manager' },
    ],
  },
  {
    name: 'Atlassian',
    logo: 'https://logo.clearbit.com/atlassian.com',
    website: 'https://www.atlassian.com/company/careers',
    industry: 'Enterprise Software',
    description: 'Atlassian Corporation is an Australian software company that develops products for software developers, project managers and content management.',
    headquarters: 'Bangalore, Karnataka',
    avgPackage: 28.0,
    hrContacts: [
      { name: 'Varun Mehta', email: 'varun.mehta@atlassian.com', phone: '+91 80 4711 0000', designation: 'Talent Acquisition Lead' },
    ],
  },
  {
    name: 'Uber India',
    logo: 'https://logo.clearbit.com/uber.com',
    website: 'https://www.uber.com/in/en/careers',
    industry: 'Transportation Technology',
    description: 'Uber Technologies, Inc. is an American technology company providing ride-hailing, food delivery, and freight transport services.',
    headquarters: 'Bangalore, Karnataka',
    avgPackage: 25.0,
    hrContacts: [
      { name: 'Shreya Iyer', email: 'shreya.iyer@uber.com', phone: '+91 80 4620 0000', designation: 'Engineering Recruiter' },
    ],
  },
  {
    name: 'PayPal India',
    logo: 'https://logo.clearbit.com/paypal.com',
    website: 'https://www.paypal.com/in/webapps/mpp/jobs',
    industry: 'FinTech & Digital Payments',
    description: 'PayPal Holdings, Inc. is an American multinational financial technology company operating an online payments system.',
    headquarters: 'Chennai, Tamil Nadu',
    avgPackage: 18.0,
    hrContacts: [
      { name: 'Lakshmi Sundaram', email: 'lakshmi.sundaram@paypal.com', phone: '+91 44 6139 0000', designation: 'Campus Recruiting Manager' },
    ],
  },
  {
    name: 'Flipkart',
    logo: 'https://logo.clearbit.com/flipkart.com',
    website: 'https://www.flipkartcareers.com',
    industry: 'E-Commerce',
    description: 'Flipkart is an Indian e-commerce company, headquartered in Bangalore. It was acquired by Walmart in 2018 for US$16 billion.',
    headquarters: 'Bangalore, Karnataka',
    avgPackage: 16.0,
    hrContacts: [
      { name: 'Rohan Agarwal', email: 'rohan.agarwal@flipkart.com', phone: '+91 80 4933 0000', designation: 'University Programs Lead' },
    ],
  },
];

async function seedCompanies(count: number, dryRun: boolean): Promise<void> {
  console.log(`\n🏢 Seeding ${Math.min(count, COMPANIES.length)} companies\n`);

  const batch = db.batch();
  let successCount = 0;

  const companiesToSeed = COMPANIES.slice(0, count);

  for (const template of companiesToSeed) {
    try {
      const companyRef = db.collection('companies').doc();
      
      const company: Company = {
        id: companyRef.id,
        name: template.name,
        logo: template.logo,
        website: template.website,
        industry: template.industry,
        description: template.description,
        headquarters: template.headquarters,
        totalDrives: Math.floor(Math.random() * 10) + 1,
        totalHires: Math.floor(Math.random() * 50) + 5,
        averagePackageLPA: template.avgPackage,
        lastVisitYear: 2024,
        hrContacts: template.hrContacts,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      if (dryRun) {
        console.log(`   [DRY RUN] ${company.name.padEnd(40)} | ${company.industry.padEnd(30)} | ₹${company.averagePackageLPA} LPA`);
      } else {
        batch.set(companyRef, company);
      }
      
      successCount++;
    } catch (error) {
      console.log(`   ❌ Error creating company ${template.name}: ${error}`);
    }
  }

  if (!dryRun && successCount > 0) {
    console.log(`   💾 Committing ${successCount} companies to database...`);
    await batch.commit();
  }

  console.log(`\n✅ Created ${successCount} companies${dryRun ? ' (dry run)' : ''}\n`);
}

async function main() {
  try {
    const args = process.argv.slice(2);
    let count = COMPANIES.length;
    let dryRun = false;

    for (const arg of args) {
      if (arg.startsWith('--count=')) {
        count = parseInt(arg.slice(8), 10);
      } else if (arg === '--dry-run') {
        dryRun = true;
      }
    }

    await seedCompanies(count, dryRun);
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
