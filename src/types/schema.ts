import { Timestamp } from 'firebase/firestore';

export type PlacementTier = 'regular' | 'dream' | 'superDream';

export type UserRole = 'student' | 'tpo' | 'admin';

export type DriveStatus = 
  | 'draft'
  | 'upcoming'
  | 'open'
  | 'closed'
  | 'in-progress'
  | 'completed'
  | 'cancelled';

export type ApplicationStatus =
  | 'applied'
  | 'shortlisted'
  | 'round-1'
  | 'round-2'
  | 'round-3'
  | 'selected'
  | 'rejected'
  | 'withdrawn';

export type Gender = 'male' | 'female' | 'other' | 'prefer-not-to-say';

export interface PlacementStatus {
  isPlaced: boolean;
  currentTier: PlacementTier | null;
  offers: PlacedOffer[];
  isDebarred: boolean;
  debarmentReason?: string;
  debarmentDate?: Date;
}

export interface PlacedOffer {
  driveId: string;
  companyId: string;
  companyName: string;
  tier: PlacementTier;
  packageLPA: number;
  offerDate: Date;
  acceptedAt?: Date;
  offerLetterUrl?: string;
}

export interface AcademicRecord {
  semester: number;
  sgpa: number;
  credits: number;
  backlogs: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  emailVerified: boolean;
  photoURL?: string;

  fullName: string;
  rollNumber: string;
  gender: Gender;
  dateOfBirth: Date;
  phone: string;
  alternatePhone?: string;
  
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
  };

  programCode: string;
  programName: string;
  department: string;
  admissionYear: number;
  passingYear: number;
  batch: string;
  currentYear: number;
  isLateralEntry: boolean;
  
  cgpa: number;
  activeBacklogs: number;
  totalBacklogs: number;
  semesterRecords?: AcademicRecord[];
  
  tenthPercentage: number;
  tenthBoard: string;
  tenthYear: number;
  twelfthPercentage: number;
  twelfthBoard: string;
  twelfthYear: number;

  placementStatus: PlacementStatus;

  appliedDrives: string[];
  
  resumeUrl?: string;
  resumeUpdatedAt?: Date;
  skills?: string[];
  extractedSkills?: string[];
  
  profileCompletionPercent: number;
  isProfileComplete: boolean;
  
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

export interface DriveEligibility {
  minCGPA: number;
  maxBacklogs?: number;
  allowedPrograms: string[];
  allowedBatches?: string[];
  minTenthPercent?: number;
  minTwelfthPercent?: number;
  genderRestriction?: Gender;
  customCriteria?: string;
}

export interface DriveRound {
  id: string;
  name: string;
  type: 'aptitude' | 'coding' | 'technical' | 'hr' | 'gd' | 'case-study' | 'other';
  date?: Date;
  venue?: string;
  duration?: number;
  description?: string;
  isOnline: boolean;
  meetingLink?: string;
}

export interface DriveDocument {
  id: string;
  name: string;
  url: string;
  type: 'jd' | 'brochure' | 'other';
  uploadedAt: Date;
}

export interface PlacementDrive {
  id: string;
  
  companyId: string;
  companyName: string;
  companyLogo?: string;
  industry: string;
  website?: string;
  
  jobTitle: string;
  jobDescription: string;
  jobType: 'full-time' | 'internship' | 'ppo';
  workLocation: string;
  isRemote: boolean;
  
  tier: PlacementTier;
  packageLPA: number;
  packageBreakdown?: {
    baseSalary: number;
    bonus?: number;
    stocks?: number;
    other?: number;
  };
  stipendPerMonth?: number;
  
  eligibility: DriveEligibility;
  
  rounds: DriveRound[];
  
  applicationDeadline: Date;
  driveDate?: Date;
  
  status: DriveStatus;
  
  applicantCount: number;
  shortlistedCount: number;
  selectedCount: number;
  
  documents: DriveDocument[];
  
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

export interface ApplicationRoundResult {
  roundId: string;
  roundName: string;
  status: 'pending' | 'passed' | 'failed' | 'absent';
  score?: number;
  feedback?: string;
  evaluatedAt?: Date;
  evaluatedBy?: string;
}

export interface Application {
  id: string;
  driveId: string;
  studentId: string;
  
  studentName: string;
  studentRollNumber: string;
  studentEmail: string;
  studentCGPA: number;
  studentProgram: string;
  
  companyName: string;
  packageLPA: number;
  tier: PlacementTier;
  
  status: ApplicationStatus;
  currentRound?: string;
  
  roundResults: ApplicationRoundResult[];
  
  resumeUrl: string;
  
  scheduledSlot?: {
    date: Date;
    time: string;
    panel?: string;
    venue?: string;
    meetingLink?: string;
  };
  
  offerPackageLPA?: number;
  offerLetterUrl?: string;
  offerAccepted?: boolean;
  offerAcceptedAt?: Date;
  
  appliedAt: Date;
  updatedAt: Date;
  withdrawnAt?: Date;
  withdrawalReason?: string;
}

export interface Company {
  id: string;
  name: string;
  logo?: string;
  website?: string;
  industry: string;
  description?: string;
  headquarters?: string;
  
  totalDrives: number;
  totalHires: number;
  averagePackageLPA: number;
  lastVisitYear?: number;
  
  hrContacts: {
    name: string;
    email: string;
    phone?: string;
    designation?: string;
  }[];
  
  createdAt: Date;
  updatedAt: Date;
}

export interface EligibilityConfig {
  thresholds: {
    regular: { min: number; max: number };
    dream: { min: number; max: number };
    superDream: { min: number; max: number };
  };
  rules: {
    allowMultipleRegular: boolean;
    allowBacklogStudents: boolean;
    maxBacklogsAllowed: number;
    allowDebarredAfterPeriod: boolean;
    debarmentPeriodDays: number;
  };
  updatedAt: Date;
  updatedBy: string;
}

export interface PortalSettings {
  portalName: string;
  instituteName: string;
  academicYear: string;
  placementSeason: string;
  
  isRegistrationOpen: boolean;
  isDriveApplicationOpen: boolean;
  isResumeUploadEnabled: boolean;
  isAIFeaturesEnabled: boolean;
  
  announcement?: {
    title: string;
    message: string;
    type: 'info' | 'warning' | 'success';
    expiresAt?: Date;
  };
  
  tpoEmail: string;
  tpoPhone: string;
  
  updatedAt: Date;
  updatedBy: string;
}

export interface ExtractedSkill {
  id: string;
  name: string;
  category: 'language' | 'framework' | 'database' | 'tool' | 'soft-skill' | 'other';
  confidence: number;
  source: 'resume' | 'manual';
  extractedAt: Date;
}

export interface ResumeParseResult {
  skills: string[];
  cgpa?: number;
  projects: {
    title: string;
    description?: string;
    technologies?: string[];
  }[];
  experience?: {
    company: string;
    role: string;
    duration?: string;
  }[];
  rawText: string;
  parsedAt: Date;
}

export interface InterviewPanel {
  id: string;
  name: string;
  interviewers: string[];
  room?: string;
  capacity: number;
}

export interface InterviewSlot {
  studentId: string;
  studentName: string;
  studentRollNumber: string;
  panelId: string;
  panelName: string;
  date: Date;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'completed' | 'no-show' | 'rescheduled';
}

export interface ScheduleConfig {
  driveId: string;
  date: Date;
  startTime: string;
  endTime: string;
  slotDuration: number;
  breakDuration: number;
  lunchBreak?: {
    start: string;
    end: string;
  };
}

export type WithId<T> = T & { id: string };

export type UpdateData<T> = Partial<{
  [K in keyof T]: T[K] extends object ? UpdateData<T[K]> : T[K];
}>;

export type FirestoreData<T> = {
  [K in keyof T]: T[K] extends Date ? Timestamp : T[K];
};

export interface SessionUser {
  uid: string;
  email: string;
  role: UserRole;
  programCode?: string;
  fullName?: string;
  photoURL?: string;
}
