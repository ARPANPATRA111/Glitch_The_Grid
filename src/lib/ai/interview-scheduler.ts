import { format, addMinutes, parse, isWithinInterval, isBefore, isAfter } from 'date-fns';
import type { InterviewPanel, InterviewSlot, ScheduleConfig } from '@/types/schema';

export interface StudentForScheduling {
  id: string;
  name: string;
  rollNumber: string;
  email: string;
  program?: string;
}

export interface AllocatedSlot extends InterviewSlot {
  slotNumber: number;
  studentEmail: string;
  formattedDate: string;
  formattedTime: string;
}

export interface AllocationResult {
  success: boolean;
  slots: AllocatedSlot[];
  unassigned: StudentForScheduling[];
  statistics: {
    totalStudents: number;
    totalSlots: number;
    slotsPerPanel: Record<string, number>;
    estimatedEndTime: string;
  };
  error?: string;
}

export function allocateSlots(
  students: StudentForScheduling[],
  panels: InterviewPanel[],
  config: ScheduleConfig
): AllocationResult {
  if (!students.length) {
    return {
      success: false,
      slots: [],
      unassigned: [],
      statistics: getEmptyStatistics(),
      error: 'No students provided for scheduling',
    };
  }

  if (!panels.length) {
    return {
      success: false,
      slots: [],
      unassigned: students,
      statistics: getEmptyStatistics(),
      error: 'No panels provided for scheduling',
    };
  }

  const slots: AllocatedSlot[] = [];
  const unassigned: StudentForScheduling[] = [];
  const slotsPerPanel: Record<string, number> = {};
  
  panels.forEach((panel) => {
    slotsPerPanel[panel.id] = 0;
  });

  const timeSlots = generateTimeSlots(config);
  
  if (timeSlots.length === 0) {
    return {
      success: false,
      slots: [],
      unassigned: students,
      statistics: getEmptyStatistics(),
      error: 'No valid time slots available with given configuration',
    };
  }

  const totalAvailableSlots = timeSlots.length * panels.length;
  
  if (totalAvailableSlots < students.length) {
    console.warn(
      `Warning: Not enough slots (${totalAvailableSlots}) for all students (${students.length})`
    );
  }

  let slotNumber = 1;
  let timeSlotIndex = 0;
  let panelIndex = 0;

  const studentQueue = [...students];

  while (studentQueue.length > 0 && timeSlotIndex < timeSlots.length) {
    const student = studentQueue.shift()!;
    const panel = panels[panelIndex]!;
    const timeSlot = timeSlots[timeSlotIndex]!;

    const slot: AllocatedSlot = {
      studentId: student.id,
      studentName: student.name,
      studentRollNumber: student.rollNumber,
      studentEmail: student.email,
      panelId: panel.id,
      panelName: panel.name,
      date: config.date,
      startTime: timeSlot.start,
      endTime: timeSlot.end,
      status: 'scheduled',
      slotNumber,
      formattedDate: format(config.date, 'dd MMM yyyy'),
      formattedTime: `${timeSlot.start} - ${timeSlot.end}`,
    };

    slots.push(slot);
    slotsPerPanel[panel.id]!++;
    slotNumber++;

    panelIndex++;
    
    if (panelIndex >= panels.length) {
      panelIndex = 0;
      timeSlotIndex++;
    }
  }

  unassigned.push(...studentQueue);

  const lastSlot = slots[slots.length - 1];
  const estimatedEndTime = lastSlot?.endTime ?? config.startTime;

  return {
    success: true,
    slots,
    unassigned,
    statistics: {
      totalStudents: students.length,
      totalSlots: slots.length,
      slotsPerPanel,
      estimatedEndTime,
    },
  };
}

interface TimeSlot {
  start: string;
  end: string;
}

function generateTimeSlots(config: ScheduleConfig): TimeSlot[] {
  const slots: TimeSlot[] = [];
  
  const baseDate = config.date;
  let currentTime = parse(config.startTime, 'HH:mm', baseDate);
  const endTime = parse(config.endTime, 'HH:mm', baseDate);
  
  let lunchStart: Date | null = null;
  let lunchEnd: Date | null = null;
  
  if (config.lunchBreak) {
    lunchStart = parse(config.lunchBreak.start, 'HH:mm', baseDate);
    lunchEnd = parse(config.lunchBreak.end, 'HH:mm', baseDate);
  }

  const slotDuration = config.slotDuration;
  const breakDuration = config.breakDuration ?? 0;

  while (isBefore(currentTime, endTime)) {
    const slotEnd = addMinutes(currentTime, slotDuration);

    if (isAfter(slotEnd, endTime)) {
      break;
    }

    if (
      lunchStart && 
      lunchEnd && 
      (isWithinInterval(currentTime, { start: lunchStart, end: lunchEnd }) ||
       isWithinInterval(slotEnd, { start: lunchStart, end: lunchEnd }) ||
       (isBefore(currentTime, lunchStart) && isAfter(slotEnd, lunchEnd)))
    ) {
      currentTime = lunchEnd;
      continue;
    }

    slots.push({
      start: format(currentTime, 'HH:mm'),
      end: format(slotEnd, 'HH:mm'),
    });

    currentTime = addMinutes(slotEnd, breakDuration);
  }

  return slots;
}

export function exportSlotsToCSV(slots: AllocatedSlot[]): string {
  const headers = [
    'Slot #',
    'Date',
    'Time',
    'Panel',
    'Roll Number',
    'Student Name',
    'Email',
  ];

  const rows = slots.map((slot) => [
    slot.slotNumber.toString(),
    slot.formattedDate,
    slot.formattedTime,
    slot.panelName,
    slot.studentRollNumber,
    slot.studentName,
    slot.studentEmail,
  ]);

  const csv = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');

  return csv;
}

export function exportSlotsByPanel(
  slots: AllocatedSlot[],
  panels: InterviewPanel[]
): Map<string, string> {
  const csvByPanel = new Map<string, string>();

  for (const panel of panels) {
    const panelSlots = slots.filter((s) => s.panelId === panel.id);
    const csv = exportSlotsToCSV(panelSlots);
    csvByPanel.set(panel.name, csv);
  }

  return csvByPanel;
}

function getEmptyStatistics() {
  return {
    totalStudents: 0,
    totalSlots: 0,
    slotsPerPanel: {},
    estimatedEndTime: '',
  };
}

export function calculateOptimalSlotDuration(
  studentCount: number,
  panelCount: number,
  availableHours: number,
  breakDuration: number = 5
): number {
  const totalMinutes = availableHours * 60;
  const slotsNeeded = Math.ceil(studentCount / panelCount);
  
  const maxDuration = Math.floor(totalMinutes / slotsNeeded) - breakDuration;
  
  const optimal = Math.max(15, Math.floor(maxDuration / 5) * 5);
  
  return Math.min(optimal, 60);
}

/**
 * Validate schedule configuration
 */
export function validateScheduleConfig(config: ScheduleConfig): string[] {
  const errors: string[] = [];

  if (config.slotDuration < 10) {
    errors.push('Slot duration should be at least 10 minutes');
  }

  if (config.slotDuration > 120) {
    errors.push('Slot duration should not exceed 120 minutes');
  }

  const startHour = parseInt(config.startTime.split(':')[0]!, 10);
  const endHour = parseInt(config.endTime.split(':')[0]!, 10);

  if (startHour >= endHour) {
    errors.push('End time must be after start time');
  }

  if (config.lunchBreak) {
    const lunchStartHour = parseInt(config.lunchBreak.start.split(':')[0]!, 10);
    const lunchEndHour = parseInt(config.lunchBreak.end.split(':')[0]!, 10);

    if (lunchStartHour < startHour || lunchEndHour > endHour) {
      errors.push('Lunch break must be within schedule hours');
    }
  }

  return errors;
}
