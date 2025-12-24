import type { 
  UserProfile, 
  PlacementDrive, 
  PlacementTier, 
  PlacementStatus,
  EligibilityConfig 
} from '@/types/schema';

export type EligibilityState = 
  | 'UNPLACED'
  | 'REGULAR_HOLDER'
  | 'DREAM_HOLDER'
  | 'SUPER_DREAM_HOLDER'
  | 'DEBARRED';

export interface EligibilityCheckResult {
  eligible: boolean;
  state: EligibilityState;
  reason: string;
  canUpgrade: boolean;
  currentTier: PlacementTier | null;
  targetTier: PlacementTier;
  blockedBy?: string[];
}

export interface EligibilityContext {
  student: UserProfile;
  drive: PlacementDrive;
  config: EligibilityConfig;
}

export const DEFAULT_ELIGIBILITY_CONFIG: EligibilityConfig = {
  thresholds: {
    regular: { min: 0, max: 500000 },
    dream: { min: 500000, max: 1000000 },
    superDream: { min: 1000000, max: Infinity },
  },
  rules: {
    allowMultipleRegular: false,
    allowBacklogStudents: false,
    maxBacklogsAllowed: 0,
    allowDebarredAfterPeriod: false,
    debarmentPeriodDays: 365,
  },
  updatedAt: new Date(),
  updatedBy: 'system',
};

export function getPlacementState(status: PlacementStatus): EligibilityState {
  if (status.isDebarred) {
    return 'DEBARRED';
  }

  if (!status.isPlaced || !status.currentTier) {
    return 'UNPLACED';
  }

  switch (status.currentTier) {
    case 'regular':
      return 'REGULAR_HOLDER';
    case 'dream':
      return 'DREAM_HOLDER';
    case 'superDream':
      return 'SUPER_DREAM_HOLDER';
    default:
      return 'UNPLACED';
  }
}

const TIER_HIERARCHY: Record<string, number> = {
  regular: 1,
  dream: 2,
  superDream: 3,
  super_dream: 3,
};

const STATE_TRANSITIONS: Record<EligibilityState, string[]> = {
  UNPLACED: ['regular', 'dream', 'superDream', 'super_dream'],
  REGULAR_HOLDER: ['dream', 'superDream', 'super_dream'],
  DREAM_HOLDER: ['superDream', 'super_dream'],
  SUPER_DREAM_HOLDER: [],
  DEBARRED: [],
};

const STATE_DESCRIPTIONS: Record<EligibilityState, string> = {
  UNPLACED: 'You are currently unplaced and eligible for all placement drives.',
  REGULAR_HOLDER: 'You hold a Regular offer. You can only apply for Dream and Super Dream drives.',
  DREAM_HOLDER: 'You hold a Dream offer. You can only apply for Super Dream drives.',
  SUPER_DREAM_HOLDER: 'You hold a Super Dream offer. Your placement journey is complete!',
  DEBARRED: 'You have been debarred from placement activities.',
};

export function checkEligibility(
  student: UserProfile,
  drive: PlacementDrive,
  config: EligibilityConfig = DEFAULT_ELIGIBILITY_CONFIG
): EligibilityCheckResult {
  const blockedBy: string[] = [];
  const state = getPlacementState(student.placementStatus);
  const driveTier = drive.tier;

  const baseResult: Omit<EligibilityCheckResult, 'eligible' | 'reason'> = {
    state,
    canUpgrade: false,
    currentTier: student.placementStatus.currentTier ?? null,
    targetTier: driveTier,
    blockedBy,
  };

  if (state === 'DEBARRED') {
    return {
      ...baseResult,
      eligible: false,
      reason: 'You have been debarred from placement activities. Please contact the TPO office.',
    };
  }

  const acceptableStatuses = ['open', 'registration_open', 'upcoming'];
  if (!acceptableStatuses.includes(drive.status)) {
    return {
      ...baseResult,
      eligible: false,
      reason: `This drive is currently ${drive.status}. Applications are not being accepted.`,
    };
  }

  const minCgpaRequired = drive.eligibility?.minCGPA ?? 0;
  if (student.cgpa < minCgpaRequired) {
    blockedBy.push('CGPA');
    return {
      ...baseResult,
      eligible: false,
      reason: `Your CGPA (${student.cgpa.toFixed(2)}) does not meet the minimum requirement (${minCgpaRequired.toFixed(2)}).`,
      blockedBy,
    };
  }

  const maxBacklogs = drive.eligibility.maxBacklogs ?? config.rules.maxBacklogsAllowed;
  if (student.activeBacklogs > maxBacklogs) {
    blockedBy.push('Backlogs');
    return {
      ...baseResult,
      eligible: false,
      reason: `You have ${student.activeBacklogs} active backlog(s). Maximum allowed: ${maxBacklogs}.`,
      blockedBy,
    };
  }

  if (
    drive.eligibility.allowedPrograms.length > 0 &&
    !drive.eligibility.allowedPrograms.includes(student.programCode)
  ) {
    blockedBy.push('Program');
    return {
      ...baseResult,
      eligible: false,
      reason: `Your program (${student.programCode}) is not eligible for this drive.`,
      blockedBy,
    };
  }

  if (
    drive.eligibility.allowedBatches &&
    drive.eligibility.allowedBatches.length > 0 &&
    !drive.eligibility.allowedBatches.includes(student.batch)
  ) {
    blockedBy.push('Batch');
    return {
      ...baseResult,
      eligible: false,
      reason: `Your batch (${student.batch}) is not eligible for this drive.`,
      blockedBy,
    };
  }

  const allowedTiers = STATE_TRANSITIONS[state];
  
  if (!allowedTiers.includes(driveTier)) {
    const currentTierLabel = student.placementStatus.currentTier 
      ? formatTierName(student.placementStatus.currentTier)
      : 'none';
    const targetTierLabel = formatTierName(driveTier);

    return {
      ...baseResult,
      eligible: false,
      reason: generateTierBlockedReason(state, driveTier, currentTierLabel, targetTierLabel),
      blockedBy: ['Placement Tier'],
    };
  }

  if (student.appliedDrives?.includes(drive.id)) {
    return {
      ...baseResult,
      eligible: false,
      reason: 'You have already applied to this drive.',
      blockedBy: ['Already Applied'],
    };
  }

  const currentTier = student.placementStatus.currentTier;
  const canUpgrade = 
    state !== 'UNPLACED' && 
    currentTier !== null &&
    (TIER_HIERARCHY[driveTier] ?? 0) > (TIER_HIERARCHY[currentTier] ?? 0);

  return {
    ...baseResult,
    eligible: true,
    canUpgrade,
    reason: canUpgrade && currentTier
      ? `You are eligible to upgrade from ${formatTierName(currentTier)} to ${formatTierName(driveTier)}.`
      : 'You meet all eligibility criteria for this drive.',
  };
}

export function formatTierName(tier: PlacementTier): string {
  const names: Record<PlacementTier, string> = {
    regular: 'Regular',
    dream: 'Dream',
    superDream: 'Super Dream',
  };
  return names[tier];
}

function generateTierBlockedReason(
  state: EligibilityState,
  targetTier: PlacementTier,
  currentTierLabel: string,
  targetTierLabel: string
): string {
  switch (state) {
    case 'SUPER_DREAM_HOLDER':
      return 'Congratulations! You already hold a Super Dream offer. Your placement journey is complete and you cannot apply to more drives.';
    
    case 'DREAM_HOLDER':
      return `You hold a Dream offer and can only apply to Super Dream drives. This is a ${targetTierLabel} drive.`;
    
    case 'REGULAR_HOLDER':
      if (targetTier === 'regular') {
        return 'You already hold a Regular offer. You cannot apply to another Regular drive. Only Dream and Super Dream drives are available to you.';
      }
      return `You hold a ${currentTierLabel} offer. Only Dream and Super Dream drives are available.`;
    
    default:
      return STATE_DESCRIPTIONS[state];
  }
}

export function getTierFromPackage(
  packageLPA: number,
  config: EligibilityConfig = DEFAULT_ELIGIBILITY_CONFIG
): PlacementTier {
  const packageAmount = packageLPA * 100000; // Convert LPA to absolute

  if (packageAmount >= config.thresholds.superDream.min) {
    return 'superDream';
  }
  if (packageAmount >= config.thresholds.dream.min) {
    return 'dream';
  }
  return 'regular';
}

export function getTierPackageRange(
  tier: PlacementTier,
  config: EligibilityConfig = DEFAULT_ELIGIBILITY_CONFIG
): string {
  const threshold = config.thresholds[tier];
  const minLPA = threshold.min / 100000;
  const maxLPA = threshold.max === Infinity ? '∞' : threshold.max / 100000;

  if (tier === 'regular') {
    return `< ${config.thresholds.dream.min / 100000} LPA`;
  }
  if (tier === 'superDream') {
    return `> ${minLPA} LPA`;
  }
  return `${minLPA} - ${maxLPA} LPA`;
}

export function canUpgradeOffer(
  currentTier: PlacementTier | null,
  targetTier: PlacementTier
): boolean {
  if (!currentTier) return true;
  return (TIER_HIERARCHY[targetTier] ?? 0) > (TIER_HIERARCHY[currentTier] ?? 0);
}

export function getAvailableTiers(status: PlacementStatus): PlacementTier[] {
  const state = getPlacementState(status);
  const transitions = STATE_TRANSITIONS[state];
  // Filter to ensure only valid PlacementTier values are returned
  return transitions.filter((t): t is PlacementTier => 
    t === 'regular' || t === 'dream' || t === 'superDream'
  );
}

export function batchCheckEligibility(
  students: UserProfile[],
  drive: PlacementDrive,
  config?: EligibilityConfig
): Map<string, EligibilityCheckResult> {
  const results = new Map<string, EligibilityCheckResult>();

  for (const student of students) {
    results.set(student.uid, checkEligibility(student, drive, config));
  }

  return results;
}

export function filterEligibleStudents(
  students: UserProfile[],
  drive: PlacementDrive,
  config?: EligibilityConfig
): UserProfile[] {
  return students.filter(
    (student) => checkEligibility(student, drive, config).eligible
  );
}

export function getEligibilityStats(
  students: UserProfile[],
  drive: PlacementDrive,
  config?: EligibilityConfig
): {
  total: number;
  eligible: number;
  ineligible: number;
  blockedReasons: Record<string, number>;
} {
  const stats = {
    total: students.length,
    eligible: 0,
    ineligible: 0,
    blockedReasons: {} as Record<string, number>,
  };

  for (const student of students) {
    const result = checkEligibility(student, drive, config);
    
    if (result.eligible) {
      stats.eligible++;
    } else {
      stats.ineligible++;
      
      if (result.blockedBy) {
        for (const reason of result.blockedBy) {
          stats.blockedReasons[reason] = (stats.blockedReasons[reason] ?? 0) + 1;
        }
      }
    }
  }

  return stats;
}
