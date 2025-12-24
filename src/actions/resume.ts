'use server';

import { writeFile, unlink, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { getAdminFirestore } from '@/lib/firebase/admin';
import { getSession } from './auth';

export interface ResumeUploadResult {
  success: boolean;
  error?: string;
  url?: string;
  extractedSkills?: string[];
}

export interface SkillUpdateResult {
  success: boolean;
  error?: string;
  skills?: string[];
}

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'resumes');

const SKILL_PATTERNS: { pattern: RegExp; skill: string }[] = [
  { pattern: /\bjavascript\b/gi, skill: 'JavaScript' },
  { pattern: /\btypescript\b/gi, skill: 'TypeScript' },
  { pattern: /\bpython\b/gi, skill: 'Python' },
  { pattern: /\bjava\b/gi, skill: 'Java' },
  { pattern: /\breact[\s-]?native\b/gi, skill: 'React Native' },
  { pattern: /\breact\b/gi, skill: 'React' },
  { pattern: /\bnext\.?js\b/gi, skill: 'Next.js' },
  { pattern: /\bnode\.?js\b/gi, skill: 'Node.js' },
  { pattern: /\bvue\.?js\b/gi, skill: 'Vue.js' },
  { pattern: /\bangular\b/gi, skill: 'Angular' },
  { pattern: /\bexpress\.?js\b/gi, skill: 'Express.js' },
  { pattern: /\bexpress\b/gi, skill: 'Express.js' },
  { pattern: /\bmongodb\b/gi, skill: 'MongoDB' },
  { pattern: /\bpostgresql?\b/gi, skill: 'PostgreSQL' },
  { pattern: /\bmysql\b/gi, skill: 'MySQL' },
  { pattern: /\bsqlite\b/gi, skill: 'SQLite' },
  { pattern: /\bfirebase\b/gi, skill: 'Firebase' },
  { pattern: /\bsupabase\b/gi, skill: 'Supabase' },
  { pattern: /\bdocker\b/gi, skill: 'Docker' },
  { pattern: /\bkubernetes\b/gi, skill: 'Kubernetes' },
  { pattern: /\baws\b/gi, skill: 'AWS' },
  { pattern: /\bazure\b/gi, skill: 'Azure' },
  { pattern: /\bgoogle\s?cloud\b/gi, skill: 'Google Cloud' },
  { pattern: /\bgit\b/gi, skill: 'Git' },
  { pattern: /\bgithub\b/gi, skill: 'GitHub' },
  { pattern: /\bgitlab\b/gi, skill: 'GitLab' },
  { pattern: /\bhtml5?\b/gi, skill: 'HTML' },
  { pattern: /\bcss3?\b/gi, skill: 'CSS' },
  { pattern: /\btailwind\b/gi, skill: 'Tailwind CSS' },
  { pattern: /\bbootstrap\b/gi, skill: 'Bootstrap' },
  { pattern: /\bredux\b/gi, skill: 'Redux' },
  { pattern: /\bgraphql\b/gi, skill: 'GraphQL' },
  { pattern: /\bc\+\+\b/gi, skill: 'C++' },
  { pattern: /\bc#\b/gi, skill: 'C#' },
  { pattern: /\bgolang\b/gi, skill: 'Go' },
  { pattern: /\bgo\b/gi, skill: 'Go' },
  { pattern: /\brust\b/gi, skill: 'Rust' },
  { pattern: /\bphp\b/gi, skill: 'PHP' },
  { pattern: /\blaravel\b/gi, skill: 'Laravel' },
  { pattern: /\bdjango\b/gi, skill: 'Django' },
  { pattern: /\bflask\b/gi, skill: 'Flask' },
  { pattern: /\bspring\s?boot\b/gi, skill: 'Spring Boot' },
  { pattern: /\bredis\b/gi, skill: 'Redis' },
  { pattern: /\belasticsearch\b/gi, skill: 'Elasticsearch' },
  { pattern: /\btensorflow\b/gi, skill: 'TensorFlow' },
  { pattern: /\bpytorch\b/gi, skill: 'PyTorch' },
  { pattern: /\bpandas\b/gi, skill: 'Pandas' },
  { pattern: /\bnumpy\b/gi, skill: 'NumPy' },
  { pattern: /\bscikit[\s-]?learn\b/gi, skill: 'Scikit-learn' },
  { pattern: /\bfigma\b/gi, skill: 'Figma' },
  { pattern: /\bpostman\b/gi, skill: 'Postman' },
  { pattern: /\bjest\b/gi, skill: 'Jest' },
  { pattern: /\bcypress\b/gi, skill: 'Cypress' },
  { pattern: /\bstreamlit\b/gi, skill: 'Streamlit' },
  { pattern: /\bexpo\b/gi, skill: 'Expo' },
  { pattern: /\bvercel\b/gi, skill: 'Vercel' },
  { pattern: /\bnetlify\b/gi, skill: 'Netlify' },
  { pattern: /\bheroku\b/gi, skill: 'Heroku' },
  { pattern: /\bshadcn\b/gi, skill: 'Shadcn UI' },
  { pattern: /\bcanva\b/gi, skill: 'Canva' },
  { pattern: /\bnotion\b/gi, skill: 'Notion' },
  { pattern: /\bollama\b/gi, skill: 'Ollama' },
  { pattern: /\bdeepseek\b/gi, skill: 'DeepSeek' },
  { pattern: /\bgemini\b/gi, skill: 'Gemini' },
  { pattern: /\bopenai\b/gi, skill: 'OpenAI' },
  { pattern: /\banthropic\b/gi, skill: 'Anthropic' },
  { pattern: /\bchromadb\b/gi, skill: 'ChromaDB' },
  { pattern: /\blangchain\b/gi, skill: 'LangChain' },
  { pattern: /\bsql\b/gi, skill: 'SQL' },
  { pattern: /\brest\s?api\b/gi, skill: 'REST API' },
  { pattern: /\bci\s?\/?\s?cd\b/gi, skill: 'CI/CD' },
  { pattern: /\blinux\b/gi, skill: 'Linux' },
  { pattern: /\bbash\b/gi, skill: 'Bash' },
  { pattern: /\bjwt\b/gi, skill: 'JWT' },
  { pattern: /\boauth\b/gi, skill: 'OAuth' },
  { pattern: /\bwebpack\b/gi, skill: 'Webpack' },
  { pattern: /\bvite\b/gi, skill: 'Vite' },
  { pattern: /\bjira\b/gi, skill: 'Jira' },
  { pattern: /\bconfluence\b/gi, skill: 'Confluence' },
  { pattern: /\bswagger\b/gi, skill: 'Swagger' },
  { pattern: /\bsentence[\s-]?transformers?\b/gi, skill: 'Sentence Transformers' },
  { pattern: /\brag\b/gi, skill: 'RAG' },
];

async function ensureUploadDir(): Promise<void> {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
}

function extractSkillsFromText(text: string): string[] {
  const foundSkills = new Set<string>();
  
  for (const { pattern, skill } of SKILL_PATTERNS) {
    if (pattern.test(text)) {
      foundSkills.add(skill);
    }
  }
  
  return Array.from(foundSkills).sort();
}

async function extractTextFromPDF(pdfBuffer: Buffer): Promise<string> {
  try {
    const pdfParse = require('pdf-parse');
    const data = await pdfParse(pdfBuffer);
    return data.text || '';
  } catch {
    const textContent = pdfBuffer.toString('utf-8');
    const cleanText = textContent.replace(/[^\x20-\x7E\n]/g, ' ');
    return cleanText;
  }
}

async function parseResumeWithAI(pdfBuffer: Buffer): Promise<string[]> {
  try {
    const text = await extractTextFromPDF(pdfBuffer);
    
    if (text.length < 100) {
      return [];
    }
    
    const skills = extractSkillsFromText(text);
    
    return skills;
  } catch {
    return [];
  }
}

function normalizeSkill(skill: string): string {
  const normalizations: Record<string, string> = {
    'js': 'JavaScript',
    'ts': 'TypeScript',
    'py': 'Python',
    'nodejs': 'Node.js',
    'reactjs': 'React',
    'vuejs': 'Vue.js',
    'nextjs': 'Next.js',
    'expressjs': 'Express.js',
    'postgres': 'PostgreSQL',
    'mongo': 'MongoDB',
    'k8s': 'Kubernetes',
    'gcp': 'Google Cloud',
    'cpp': 'C++',
    'csharp': 'C#',
    'golang': 'Go',
    'tailwindcss': 'Tailwind CSS',
  };
  
  const lower = skill.toLowerCase().trim();
  return normalizations[lower] || skill.charAt(0).toUpperCase() + skill.slice(1);
}

export async function uploadResume(formData: FormData): Promise<ResumeUploadResult> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: 'Not authenticated' };
    }

    const file = formData.get('file') as File;
    if (!file) {
      return { success: false, error: 'No file provided' };
    }

    if (file.type !== 'application/pdf') {
      return { success: false, error: 'Only PDF files are allowed' };
    }

    if (file.size > 5 * 1024 * 1024) {
      return { success: false, error: 'File size must be less than 5MB' };
    }

    await ensureUploadDir();

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const fileName = `${session.uid}_${Date.now()}_resume.pdf`;
    const filePath = path.join(UPLOAD_DIR, fileName);

    const db = getAdminFirestore();
    const userDoc = await db.collection('users').doc(session.uid).get();
    const userData = userDoc.data();

    if (userData?.resumeUrl) {
      try {
        const oldFileName = userData.resumeUrl.split('/').pop();
        if (oldFileName) {
          const oldFilePath = path.join(UPLOAD_DIR, oldFileName);
          if (existsSync(oldFilePath)) {
            await unlink(oldFilePath);
          }
        }
      } catch (deleteError) {
        console.error('Failed to delete old resume:', deleteError);
      }
    }

    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/resumes/${fileName}`;

    const extractedSkills = await parseResumeWithAI(buffer);

    await db.collection('users').doc(session.uid).update({
      resumeUrl: publicUrl,
      resumeUpdatedAt: new Date(),
      extractedSkills: extractedSkills,
      updatedAt: new Date(),
    });

    return { success: true, url: publicUrl, extractedSkills };
  } catch (error) {
    console.error('Resume upload failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload resume',
    };
  }
}

export async function updateSkills(skills: string[]): Promise<SkillUpdateResult> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: 'Not authenticated' };
    }

    const normalizedSkills = skills
      .map(s => s.trim())
      .filter(s => s.length > 0)
      .map(s => normalizeSkill(s));
    
    const uniqueSkills = [...new Set(normalizedSkills)];

    const db = getAdminFirestore();
    await db.collection('users').doc(session.uid).update({
      extractedSkills: uniqueSkills,
      updatedAt: new Date(),
    });

    return { success: true, skills: uniqueSkills };
  } catch (error) {
    console.error('Skills update failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update skills',
    };
  }
}

export async function addSkill(skill: string): Promise<SkillUpdateResult> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: 'Not authenticated' };
    }

    if (!skill.trim()) {
      return { success: false, error: 'Skill cannot be empty' };
    }

    const normalizedSkill = normalizeSkill(skill.trim());

    const db = getAdminFirestore();
    const userDoc = await db.collection('users').doc(session.uid).get();
    const userData = userDoc.data();

    const currentSkills: string[] = userData?.extractedSkills || [];
    
    if (currentSkills.includes(normalizedSkill)) {
      return { success: false, error: 'Skill already exists' };
    }

    const updatedSkills = [...currentSkills, normalizedSkill];

    await db.collection('users').doc(session.uid).update({
      extractedSkills: updatedSkills,
      updatedAt: new Date(),
    });

    return { success: true, skills: updatedSkills };
  } catch (error) {
    console.error('Add skill failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add skill',
    };
  }
}

export async function removeSkill(skill: string): Promise<SkillUpdateResult> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: 'Not authenticated' };
    }

    const db = getAdminFirestore();
    const userDoc = await db.collection('users').doc(session.uid).get();
    const userData = userDoc.data();

    const currentSkills: string[] = userData?.extractedSkills || [];
    const updatedSkills = currentSkills.filter(s => s !== skill);

    await db.collection('users').doc(session.uid).update({
      extractedSkills: updatedSkills,
      updatedAt: new Date(),
    });

    return { success: true, skills: updatedSkills };
  } catch (error) {
    console.error('Remove skill failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to remove skill',
    };
  }
}

export async function deleteResume(): Promise<ResumeUploadResult> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: 'Not authenticated' };
    }

    const db = getAdminFirestore();
    const userDoc = await db.collection('users').doc(session.uid).get();
    const userData = userDoc.data();

    if (userData?.resumeUrl) {
      try {
        const fileName = userData.resumeUrl.split('/').pop();
        if (fileName) {
          const filePath = path.join(UPLOAD_DIR, fileName);
          if (existsSync(filePath)) {
            await unlink(filePath);
          }
        }
      } catch (storageError) {
        console.error('Failed to delete file from storage:', storageError);
      }
    }

    await db.collection('users').doc(session.uid).update({
      resumeUrl: null,
      resumeUpdatedAt: null,
      updatedAt: new Date(),
    });

    return { success: true };
  } catch (error) {
    console.error('Resume deletion failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete resume',
    };
  }
}
