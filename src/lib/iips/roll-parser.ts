import { z } from 'zod';

export const PROGRAM_PREFIX_MAP = {
  IC: {
    code: 'MCA_INT',
    name: 'MCA (Integrated)',
    fullName: 'Master of Computer Applications (Integrated)',
    duration: 6,
    department: 'Computer Science',
  },
  IM: {
    code: 'MBA_MS',
    name: 'MBA (Management Science)',
    fullName: 'Master of Business Administration (Management Science)',
    duration: 5,
    department: 'Management',
  },
  IT: {
    code: 'MTECH_IT',
    name: 'M.Tech (IT)',
    fullName: 'Master of Technology (Information Technology)',
    duration: 5,
    department: 'Information Technology',
  },
  APR: {
    code: 'MBA_APR',
    name: 'MBA (Advertising & PR)',
    fullName: 'Master of Business Administration (Advertising & Public Relations)',
    duration: 2,
    department: 'Management',
  },
  EN: {
    code: 'MBA_ENT',
    name: 'MBA (Entrepreneurship)',
    fullName: 'Master of Business Administration (Entrepreneurship)',
    duration: 2,
    department: 'Management',
  },
  BC: {
    code: 'BCOM_HONS',
    name: 'B.Com (Hons)',
    fullName: 'Bachelor of Commerce (Honours)',
    duration: 3,
    department: 'Commerce',
  },
} as const;

export type ProgramPrefix = keyof typeof PROGRAM_PREFIX_MAP;

export interface ParsedRollNumber {
  rollNumber: string;
  prefix: ProgramPrefix;
  programCode: string;
  programName: string;
  programFullName: string;
  department: string;
  yearCode: number;
  admissionYear: number;
  duration: number;
  effectiveDuration: number;
  isLateralEntry: boolean;
  sequenceNumber: number;
  passingYear: number;
  currentYear: number;
  isFinalYear: boolean;
  isAlumni: boolean;
  batch: string;
}

export interface RollParseError {
  code: 'INVALID_FORMAT' | 'UNKNOWN_PREFIX' | 'INVALID_YEAR' | 'INVALID_SEQUENCE';
  message: string;
  rollNumber: string;
}

export type RollParseResult = 
  | { success: true; data: ParsedRollNumber }
  | { success: false; error: RollParseError };

export const rollNumberSchema = z
  .string()
  .min(8, 'Roll number is too short')
  .max(20, 'Roll number is too long')
  .transform((val) => val.toUpperCase().trim())
  .refine(
    (val) => /^[A-Z]{2,3}-2K\d{2}(-LE)?-\d{1,3}$/i.test(val),
    'Invalid roll number format. Expected: PREFIX-2KYY-SEQ or PREFIX-2KYY-LE-SEQ'
  );

export function parseRollNumber(rollNumber: string): RollParseResult {
  const normalized = rollNumber.toUpperCase().trim();

  const regex = /^([A-Z]{2,3})-2K(\d{2})(-LE)?-(\d{1,3})$/;
  const match = normalized.match(regex);

  if (!match) {
    return {
      success: false,
      error: {
        code: 'INVALID_FORMAT',
        message: `Invalid roll number format: "${rollNumber}". Expected format: PREFIX-2KYY-SEQ (e.g., IC-2K23-55)`,
        rollNumber,
      },
    };
  }

  const [, prefix, yearStr, leFlag, sequenceStr] = match;

  if (!prefix || !(prefix in PROGRAM_PREFIX_MAP)) {
    return {
      success: false,
      error: {
        code: 'UNKNOWN_PREFIX',
        message: `Unknown program prefix: "${prefix}". Valid prefixes: ${Object.keys(PROGRAM_PREFIX_MAP).join(', ')}`,
        rollNumber,
      },
    };
  }

  const programInfo = PROGRAM_PREFIX_MAP[prefix as ProgramPrefix];

  // Parse year
  const yearCode = parseInt(yearStr!, 10);
  if (isNaN(yearCode) || yearCode < 0 || yearCode > 99) {
    return {
      success: false,
      error: {
        code: 'INVALID_YEAR',
        message: `Invalid year code: "${yearStr}"`,
        rollNumber,
      },
    };
  }

  // Parse sequence number
  const sequenceNumber = parseInt(sequenceStr!, 10);
  if (isNaN(sequenceNumber) || sequenceNumber < 1) {
    return {
      success: false,
      error: {
        code: 'INVALID_SEQUENCE',
        message: `Invalid sequence number: "${sequenceStr}"`,
        rollNumber,
      },
    };
  }

  // Calculate admission year (2000 + YY)
  const admissionYear = 2000 + yearCode;

  // Check lateral entry
  const isLateralEntry = leFlag === '-LE';

  // Calculate effective duration (subtract 1 for lateral entry)
  const effectiveDuration = isLateralEntry 
    ? programInfo.duration - 1 
    : programInfo.duration;

  // Calculate passing year
  const passingYear = admissionYear + effectiveDuration;

  // Calculate current academic year (assuming July-June academic year)
  const now = new Date();
  const currentCalendarYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed
  
  // Academic year starts in July (month 6)
  const currentAcademicYear = currentMonth >= 6 
    ? currentCalendarYear 
    : currentCalendarYear - 1;

  // Calculate which year of study the student is in
  const yearsCompleted = currentAcademicYear - admissionYear;
  const currentYear = Math.min(
    Math.max(yearsCompleted + 1, 1),
    effectiveDuration
  );

  // Determine final year and alumni status
  const isFinalYear = currentYear === effectiveDuration;
  const isAlumni = currentAcademicYear >= passingYear;

  // Generate batch identifier
  const batch = `${admissionYear}-${passingYear}`;

  return {
    success: true,
    data: {
      rollNumber: normalized,
      prefix: prefix as ProgramPrefix,
      programCode: programInfo.code,
      programName: programInfo.name,
      programFullName: programInfo.fullName,
      department: programInfo.department,
      yearCode,
      admissionYear,
      duration: programInfo.duration,
      effectiveDuration,
      isLateralEntry,
      sequenceNumber,
      passingYear,
      currentYear,
      isFinalYear,
      isAlumni,
      batch,
    },
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function isValidRollNumber(rollNumber: string): boolean {
  return parseRollNumber(rollNumber).success;
}

export function getProgramCode(rollNumber: string): string | null {
  const result = parseRollNumber(rollNumber);
  return result.success ? result.data.programCode : null;
}

export function getPassingYear(rollNumber: string): number | null {
  const result = parseRollNumber(rollNumber);
  return result.success ? result.data.passingYear : null;
}

export function isProgramMatch(rollNumber: string, programCode: string): boolean {
  const result = parseRollNumber(rollNumber);
  return result.success && result.data.programCode === programCode;
}

export function isSameBatch(rollNumber1: string, rollNumber2: string): boolean {
  const result1 = parseRollNumber(rollNumber1);
  const result2 = parseRollNumber(rollNumber2);

  if (!result1.success || !result2.success) {
    return false;
  }

  return (
    result1.data.programCode === result2.data.programCode &&
    result1.data.admissionYear === result2.data.admissionYear
  );
}

export function generateRollNumber(
  prefix: ProgramPrefix,
  year: number,
  sequence: number,
  isLateralEntry: boolean = false
): string {
  const yearCode = year >= 2000 ? year - 2000 : year;
  const yearStr = yearCode.toString().padStart(2, '0');
  const leStr = isLateralEntry ? '-LE' : '';
  
  return `${prefix}-2K${yearStr}${leStr}-${sequence}`;
}

export function getValidPrefixes(): ProgramPrefix[] {
  return Object.keys(PROGRAM_PREFIX_MAP) as ProgramPrefix[];
}

export function getProgramInfo(prefix: ProgramPrefix) {
  return PROGRAM_PREFIX_MAP[prefix];
}

export function getProgramInfoByCode(programCode: string) {
  for (const [prefix, info] of Object.entries(PROGRAM_PREFIX_MAP)) {
    if (info.code === programCode) {
      return { prefix: prefix as ProgramPrefix, ...info };
    }
  }
  return null;
}

export function isPlacementEligible(rollNumber: string): boolean {
  const result = parseRollNumber(rollNumber);
  if (!result.success) return false;

  const { currentYear, effectiveDuration, isAlumni } = result.data;
  
  // Not eligible if already graduated
  if (isAlumni) return false;

  // Eligible if in final year or pre-final year
  return currentYear >= effectiveDuration - 1;
}

export function getBatchString(rollNumber: string): string | null {
  const result = parseRollNumber(rollNumber);
  if (!result.success) return null;

  const { admissionYear, passingYear, programName } = result.data;
  const shortPassingYear = passingYear.toString().slice(-2);
  
  return `${programName} Batch ${admissionYear}-${shortPassingYear}`;
}
