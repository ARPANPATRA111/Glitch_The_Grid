'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';
import { getAdminFirestore } from '@/lib/firebase/admin';
import { getSession } from '@/actions/auth';
import type { ResumeParseResult, ExtractedSkill } from '@/types/schema';

// ============================================================================
// CONFIGURATION
// ============================================================================

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY ?? '');

const SKILL_NORMALIZATION: Record<string, string> = {
  // Languages
  'js': 'JavaScript',
  'javascript': 'JavaScript',
  'ts': 'TypeScript',
  'typescript': 'TypeScript',
  'py': 'Python',
  'python': 'Python',
  'cpp': 'C++',
  'c++': 'C++',
  'csharp': 'C#',
  'c#': 'C#',
  'golang': 'Go',
  'go': 'Go',

  // Frameworks
  'reactjs': 'React',
  'react.js': 'React',
  'react': 'React',
  'nextjs': 'Next.js',
  'next.js': 'Next.js',
  'next': 'Next.js',
  'nodejs': 'Node.js',
  'node.js': 'Node.js',
  'node': 'Node.js',
  'expressjs': 'Express.js',
  'express.js': 'Express.js',
  'express': 'Express.js',
  'angular': 'Angular',
  'angularjs': 'Angular',
  'vuejs': 'Vue.js',
  'vue.js': 'Vue.js',
  'vue': 'Vue.js',
  'django': 'Django',
  'flask': 'Flask',
  'spring': 'Spring',
  'springboot': 'Spring Boot',
  'spring boot': 'Spring Boot',

  // Databases
  'mysql': 'MySQL',
  'postgres': 'PostgreSQL',
  'postgresql': 'PostgreSQL',
  'mongodb': 'MongoDB',
  'mongo': 'MongoDB',
  'redis': 'Redis',
  'firebase': 'Firebase',
  'firestore': 'Firestore',

  // Tools
  'git': 'Git',
  'github': 'GitHub',
  'docker': 'Docker',
  'kubernetes': 'Kubernetes',
  'k8s': 'Kubernetes',
  'aws': 'AWS',
  'azure': 'Azure',
  'gcp': 'Google Cloud',
  'linux': 'Linux',
};

const SKILL_CATEGORIES: Record<string, ExtractedSkill['category']> = {
  'JavaScript': 'language',
  'TypeScript': 'language',
  'Python': 'language',
  'Java': 'language',
  'C++': 'language',
  'C#': 'language',
  'Go': 'language',
  'Rust': 'language',
  'SQL': 'language',

  'React': 'framework',
  'Next.js': 'framework',
  'Node.js': 'framework',
  'Express.js': 'framework',
  'Angular': 'framework',
  'Vue.js': 'framework',
  'Django': 'framework',
  'Flask': 'framework',
  'Spring': 'framework',
  'Spring Boot': 'framework',

  'MySQL': 'database',
  'PostgreSQL': 'database',
  'MongoDB': 'database',
  'Redis': 'database',
  'Firebase': 'database',
  'Firestore': 'database',

  'Git': 'tool',
  'GitHub': 'tool',
  'Docker': 'tool',
  'Kubernetes': 'tool',
  'AWS': 'tool',
  'Azure': 'tool',
  'Google Cloud': 'tool',
  'Linux': 'tool',
  'VS Code': 'tool',
};

// ============================================================================
// TYPES
// ============================================================================

interface ParseResumeResult {
  success: boolean;
  data?: ResumeParseResult;
  error?: string;
}

interface GeminiExtraction {
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
}

// ============================================================================
// MAIN FUNCTIONS
// ============================================================================

export async function parseResume(fileUrl: string): Promise<ParseResumeResult> {
  try {
    // Verify session
    const session = await getSession();
    if (!session) {
      return { success: false, error: 'Not authenticated' };
    }

    // Check for cached result (prevent re-parsing same resume)
    const db = getAdminFirestore();
    const cacheKey = generateCacheKey(fileUrl);
    const cachedDoc = await db
      .collection('resume_cache')
      .doc(cacheKey)
      .get();

    if (cachedDoc.exists) {
      const cached = cachedDoc.data() as ResumeParseResult;
      // Return cached if less than 7 days old
      const cacheAge = Date.now() - cached.parsedAt.getTime();
      if (cacheAge < 7 * 24 * 60 * 60 * 1000) {
        return { success: true, data: cached };
      }
    }

    // Download and extract text from resume
    const resumeText = await extractTextFromResume(fileUrl);
    
    if (!resumeText || resumeText.length < 100) {
      return { 
        success: false, 
        error: 'Could not extract text from resume. Please upload a text-based PDF.' 
      };
    }

    // Call Gemini for extraction
    const extraction = await callGemini(resumeText);

    if (!extraction) {
      return { 
        success: false, 
        error: 'AI extraction failed. Please try again.' 
      };
    }

    // Normalize skills
    const normalizedSkills = normalizeSkills(extraction.skills);

    // Build result
    const result: ResumeParseResult = {
      skills: normalizedSkills,
      cgpa: extraction.cgpa,
      projects: extraction.projects,
      experience: extraction.experience,
      rawText: resumeText.substring(0, 5000), // Store first 5000 chars
      parsedAt: new Date(),
    };

    // Cache the result
    await db.collection('resume_cache').doc(cacheKey).set(result);

    // Save skills to user's subcollection
    await saveSkillsToUser(session.uid, normalizedSkills);

    // Update user profile with skills array
    await db.collection('users').doc(session.uid).update({
      skills: normalizedSkills,
      resumeUpdatedAt: new Date(),
      updatedAt: new Date(),
    });

    return { success: true, data: result };
  } catch (error) {
    console.error('Resume parsing failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to parse resume',
    };
  }
}

export async function getUserSkills(uid: string): Promise<ExtractedSkill[]> {
  const db = getAdminFirestore();
  const snapshot = await db
    .collection('users')
    .doc(uid)
    .collection('skills')
    .orderBy('confidence', 'desc')
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as ExtractedSkill[];
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function extractTextFromResume(fileUrl: string): Promise<string> {
  try {
    const response = await fetch(fileUrl);
    
    if (!response.ok) {
      throw new Error('Failed to fetch resume file');
    }

    const contentType = response.headers.get('content-type');
    
    if (contentType?.includes('text/plain')) {
      return response.text();
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 4000,
      },
    });

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: 'application/pdf',
          data: buffer.toString('base64'),
        },
      },
      'Extract and return ALL the text content from this PDF resume document. Preserve the structure and formatting as much as possible. Include all sections like education, skills, experience, projects, certifications, etc. Return only the extracted text.',
    ]);

    const extractedText = result.response.text();
    return extractedText || '';
  } catch (error) {
    console.error('Text extraction failed:', error);
    throw error;
  }
}

async function callGemini(resumeText: string): Promise<GeminiExtraction | null> {
  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 2000,
        responseMimeType: 'application/json',
      },
    });

    const prompt = `You are an expert resume parser. Extract the following information from the resume text:
1. Technical skills - Return a normalized array of skill names (e.g., "JavaScript", "Python", "React", "Node.js")
2. CGPA - If mentioned, extract the CGPA value (on 10-point scale)
3. Projects - Extract project titles, descriptions, and technologies used
4. Experience - Extract work experience with company name, role, and duration

Return the data as a valid JSON object with this structure:
{
  "skills": ["skill1", "skill2"],
  "cgpa": 8.5,
  "projects": [{"title": "...", "description": "...", "technologies": ["..."]}],
  "experience": [{"company": "...", "role": "...", "duration": "..."}]
}

Only include fields where you found relevant information. Be precise and avoid duplicates.

Resume text:
${resumeText.substring(0, 8000)}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text();
    
    if (!content) {
      return null;
    }

    // Clean the response (remove markdown code blocks if present)
    const cleanedContent = content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    return JSON.parse(cleanedContent) as GeminiExtraction;
  } catch (error) {
    console.error('Gemini API call failed:', error);
    return null;
  }
}

function normalizeSkills(skills: string[]): string[] {
  const normalized = new Set<string>();

  for (const skill of skills) {
    const lower = skill.toLowerCase().trim();
    const standard = SKILL_NORMALIZATION[lower] ?? skill;
    normalized.add(standard);
  }

  return Array.from(normalized).sort();
}

async function saveSkillsToUser(uid: string, skills: string[]): Promise<void> {
  const db = getAdminFirestore();
  const batch = db.batch();
  const skillsRef = db.collection('users').doc(uid).collection('skills');

  // Delete existing skills
  const existing = await skillsRef.get();
  existing.docs.forEach((doc) => batch.delete(doc.ref));

  // Add new skills
  for (const skill of skills) {
    const skillDoc: ExtractedSkill = {
      id: skill.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      name: skill,
      category: SKILL_CATEGORIES[skill] ?? 'other',
      confidence: 0.9,
      source: 'resume',
      extractedAt: new Date(),
    };

    batch.set(skillsRef.doc(skillDoc.id), skillDoc);
  }

  await batch.commit();
}

function generateCacheKey(fileUrl: string): string {
  // Extract filename or use hash
  const urlParts = fileUrl.split('/');
  const filename = urlParts[urlParts.length - 1] ?? 'unknown';
  return filename.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 100);
}
