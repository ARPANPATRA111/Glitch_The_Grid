'use server';

import { put, del } from '@vercel/blob';
import { getAdminFirestore } from '@/lib/firebase/admin';
import { getSession } from './auth';
import { createHash } from 'crypto';

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

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const MAX_UPLOADS_PER_WINDOW = 5;

interface RateLimitCheck {
  allowed: boolean;
  remainingUploads: number;
  resetTime?: Date;
  error?: string;
}

async function checkRateLimit(userId: string): Promise<RateLimitCheck> {
  const db = getAdminFirestore();
  const rateLimitRef = db.collection('rateLimits').doc(`resume_${userId}`);
  
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  
  const doc = await rateLimitRef.get();
  const data = doc.data();
  
  if (!data) {
    await rateLimitRef.set({
      uploads: [now],
      updatedAt: new Date(),
    });
    return { allowed: true, remainingUploads: MAX_UPLOADS_PER_WINDOW - 1 };
  }
  
  const recentUploads = (data.uploads || []).filter((ts: number) => ts > windowStart);
  
  if (recentUploads.length >= MAX_UPLOADS_PER_WINDOW) {
    const oldestUpload = Math.min(...recentUploads);
    const resetTime = new Date(oldestUpload + RATE_LIMIT_WINDOW_MS);
    const minutesRemaining = Math.ceil((resetTime.getTime() - now) / (60 * 1000));
    
    console.log(`[Rate Limit] User ${userId} exceeded limit. Reset in ${minutesRemaining} minutes.`);
    
    return {
      allowed: false,
      remainingUploads: 0,
      resetTime,
      error: `Rate limit exceeded. Please try again in ${minutesRemaining} minutes.`,
    };
  }
  
  await rateLimitRef.set({
    uploads: [...recentUploads, now],
    updatedAt: new Date(),
  });
  
  return {
    allowed: true,
    remainingUploads: MAX_UPLOADS_PER_WINDOW - recentUploads.length - 1,
  };
}

const PDF_MAGIC_NUMBER = '%PDF-';

async function validatePdfContent(file: File): Promise<{ valid: boolean; error?: string }> {
  try {
    const buffer = await file.slice(0, 10).arrayBuffer();
    const header = new TextDecoder().decode(buffer);
    
    if (!header.startsWith(PDF_MAGIC_NUMBER)) {
      console.log('[File Validation] Invalid PDF header:', header.substring(0, 5));
      return {
        valid: false,
        error: 'File does not appear to be a valid PDF. Please upload an actual PDF file.',
      };
    }
    
    console.log('[File Validation] PDF header valid');
    return { valid: true };
  } catch (error) {
    console.error('[File Validation] Error reading file:', error);
    return { valid: false, error: 'Failed to validate file content' };
  }
}

async function getFileHash(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hash = createHash('md5').update(Buffer.from(buffer)).digest('hex');
  return hash;
}

async function getCachedSkills(fileHash: string): Promise<string[] | null> {
  const db = getAdminFirestore();
  const cacheRef = db.collection('skillsCache').doc(fileHash);
  const doc = await cacheRef.get();
  
  if (doc.exists) {
    const data = doc.data();
    console.log('[Skills Cache] HIT - Found cached skills for hash:', fileHash);
    return data?.skills || null;
  }
  
  console.log('[Skills Cache] MISS - No cached skills for hash:', fileHash);
  return null;
}

async function cacheSkills(fileHash: string, skills: string[]): Promise<void> {
  const db = getAdminFirestore();
  const cacheRef = db.collection('skillsCache').doc(fileHash);
  
  await cacheRef.set({
    skills,
    createdAt: new Date(),
  });
  
  console.log('[Skills Cache] Stored skills for hash:', fileHash);
}

const SKILL_NORMALIZATIONS: Record<string, string> = {
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
  'java': 'Java',
  'rust': 'Rust',
  'sql': 'SQL',
  'php': 'PHP',
  'ruby': 'Ruby',
  'swift': 'Swift',
  'kotlin': 'Kotlin',
  'r': 'R',
  'scala': 'Scala',
  'reactjs': 'React',
  'react.js': 'React',
  'react': 'React',
  'react native': 'React Native',
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
  'laravel': 'Laravel',
  'rails': 'Ruby on Rails',
  'ruby on rails': 'Ruby on Rails',
  'fastapi': 'FastAPI',
  'tailwindcss': 'Tailwind CSS',
  'tailwind': 'Tailwind CSS',
  'bootstrap': 'Bootstrap',
  'sass': 'Sass',
  'scss': 'Sass',
  'css': 'CSS',
  'html': 'HTML',
  'materialui': 'Material UI',
  'material ui': 'Material UI',
  'shadcn': 'Shadcn UI',
  'mysql': 'MySQL',
  'postgres': 'PostgreSQL',
  'postgresql': 'PostgreSQL',
  'mongodb': 'MongoDB',
  'mongo': 'MongoDB',
  'redis': 'Redis',
  'firebase': 'Firebase',
  'firestore': 'Firestore',
  'supabase': 'Supabase',
  'sqlite': 'SQLite',
  'dynamodb': 'DynamoDB',
  'cassandra': 'Cassandra',
  'elasticsearch': 'Elasticsearch',
  'git': 'Git',
  'github': 'GitHub',
  'gitlab': 'GitLab',
  'docker': 'Docker',
  'kubernetes': 'Kubernetes',
  'k8s': 'Kubernetes',
  'aws': 'AWS',
  'azure': 'Azure',
  'gcp': 'Google Cloud',
  'google cloud': 'Google Cloud',
  'linux': 'Linux',
  'vercel': 'Vercel',
  'netlify': 'Netlify',
  'heroku': 'Heroku',
  'jenkins': 'Jenkins',
  'terraform': 'Terraform',
  'ansible': 'Ansible',
  'nginx': 'Nginx',
  'tensorflow': 'TensorFlow',
  'pytorch': 'PyTorch',
  'pandas': 'Pandas',
  'numpy': 'NumPy',
  'scikit-learn': 'Scikit-learn',
  'sklearn': 'Scikit-learn',
  'keras': 'Keras',
  'opencv': 'OpenCV',
  'langchain': 'LangChain',
  'redux': 'Redux',
  'graphql': 'GraphQL',
  'rest api': 'REST API',
  'restapi': 'REST API',
  'jest': 'Jest',
  'mocha': 'Mocha',
  'cypress': 'Cypress',
  'selenium': 'Selenium',
  'pytest': 'Pytest',
  'figma': 'Figma',
  'postman': 'Postman',
  'jira': 'Jira',
  'agile': 'Agile',
  'scrum': 'Scrum',
};

function normalizeSkill(skill: string): string {
  const lower = skill.toLowerCase().trim();
  return SKILL_NORMALIZATIONS[lower] || skill.charAt(0).toUpperCase() + skill.slice(1).toLowerCase();
}

interface DocumentSkillData {
  name?: string;
  parsed?: string;
}

interface DocumentParserResponse {
  data?: {
    skills?: DocumentSkillData[];
    hardSkills?: DocumentSkillData[];
    softSkills?: DocumentSkillData[];
  };
  meta?: {
    identifier?: string;
  };
  error?: {
    errorCode?: string;
    errorDetail?: string;
  };
}

const DOC_PROCESSOR_BASE = Buffer.from('aHR0cHM6Ly9hcGkuYWZmaW5kYS5jb20vdjM=', 'base64').toString();

async function analyzeDocumentForSkills(resumeUrl: string): Promise<string[]> {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  
  console.log('[Document AI] Starting skill extraction...');
  console.log('[Document AI] Resume URL:', resumeUrl);
  
  if (!apiKey) {
    console.error('[Document AI] ERROR: API key not configured');
    return [];
  }
  
  console.log('[Document AI] API Key found (length:', apiKey.length, ')');

  try {
    console.log('[Document AI] Step 1: Initializing processor...');
    
    const orgsRes = await fetch(`${DOC_PROCESSOR_BASE}/organizations`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json',
      },
    });

    console.log('[Document AI] Init response status:', orgsRes.status);

    if (!orgsRes.ok) {
      const errorText = await orgsRes.text();
      console.error('[Document AI] ERROR initializing:', errorText);
      return [];
    }

    const orgsData = await orgsRes.json();
    console.log('Organizations data:', JSON.stringify(orgsData, null, 2));

    let organizationId: string | null = null;

    const organizations = Array.isArray(orgsData) ? orgsData : orgsData.results;
    
    if (organizations && organizations.length > 0) {
      organizationId = organizations[0].identifier;
      console.log('[Document AI] Using processor:', organizationId);
    } else {
      console.error('[Document AI] ERROR: No processor found');
      return [];
    }

    console.log('[Document AI] Step 2: Configuring workspace...');
    
    const workspacesRes = await fetch(`${DOC_PROCESSOR_BASE}/workspaces?organization=${organizationId}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json',
      },
    });

    console.log('[Document AI] Workspace response status:', workspacesRes.status);

    if (!workspacesRes.ok) {
      const errorText = await workspacesRes.text();
      console.error('[Document AI] ERROR configuring workspace:', errorText);
      return [];
    }

    const workspacesData = await workspacesRes.json();
    const workspacesList = Array.isArray(workspacesData) ? workspacesData : workspacesData.results;
    console.log('[Document AI] Workspaces found:', workspacesList?.length || 0);
    
    let workspaceId: string | null = null;
    
    if (workspacesList && workspacesList.length > 0) {
      const iipsWorkspace = workspacesList.find((w: { name?: string }) => 
        w.name?.toLowerCase().includes('iips') || w.name?.toLowerCase().includes('placement')
      );
      workspaceId = iipsWorkspace?.identifier || workspacesList[0].identifier;
      console.log('[Document AI] Using existing workspace:', workspaceId);
    } else {
      console.log('[Document AI] Creating new workspace...');
      
      const createWsRes = await fetch(`${DOC_PROCESSOR_BASE}/workspaces`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name: 'IIPS Placement Portal',
          organization: organizationId,
        }),
      });

      if (createWsRes.ok) {
        const newWorkspace = await createWsRes.json();
        workspaceId = newWorkspace.identifier;
        console.log('[Document AI] Created workspace:', workspaceId);
      } else {
        const createError = await createWsRes.text();
        console.error('[Document AI] ERROR creating workspace:', createError);
        
        if (createError.includes('unique') || createError.includes('already')) {
          console.log('[Document AI] Workspace may exist, retrying...');
          const allWsRes = await fetch(`${DOC_PROCESSOR_BASE}/workspaces`, {
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Accept': 'application/json',
            },
          });
          
          if (allWsRes.ok) {
            const allWsData = await allWsRes.json();
            const allWorkspaces = Array.isArray(allWsData) ? allWsData : allWsData.results;
            
            if (allWorkspaces && allWorkspaces.length > 0) {
              const targetWs = allWorkspaces.find((w: { name?: string }) => 
                w.name?.toLowerCase().includes('iips')
              ) || allWorkspaces[0];
              workspaceId = targetWs.identifier;
              console.log('[Document AI] Found workspace on retry:', workspaceId);
            }
          }
        }
        
        if (!workspaceId) {
          return [];
        }
      }
    }

    if (!workspaceId) {
      console.error('[Document AI] ERROR: No workspace ID available');
      return [];
    }

    console.log('[Document AI] Step 3: Setting up document collection...');
    
    const collectionsRes = await fetch(`${DOC_PROCESSOR_BASE}/collections?workspace=${workspaceId}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json',
      },
    });

    console.log('[Document AI] Collections response status:', collectionsRes.status);

    let collectionId: string | null = null;

    if (collectionsRes.ok) {
      const collectionsData = await collectionsRes.json();
      const collectionsList = Array.isArray(collectionsData) ? collectionsData : collectionsData.results;
      console.log('[Document AI] Collections found:', collectionsList?.length || 0);

      const resumeCollection = collectionsList?.find(
        (c: { name?: string; extractor?: string }) => c.extractor === 'resume' || c.name?.toLowerCase().includes('resume')
      );

      if (resumeCollection) {
        collectionId = resumeCollection.identifier;
        console.log('[Document AI] Using existing collection:', collectionId);
      } else {
        console.log('[Document AI] Creating resume collection...');
        
        const createCollRes = await fetch(`${DOC_PROCESSOR_BASE}/collections`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            name: 'Resume Collection',
            workspace: workspaceId,
            extractor: 'resume',
          }),
        });

        if (createCollRes.ok) {
          const newCollection = await createCollRes.json();
          collectionId = newCollection.identifier;
          console.log('[Document AI] Created new collection:', collectionId);
        } else {
          const collError = await createCollRes.text();
          console.error('[Document AI] ERROR creating collection:', collError);
          
          if (collError.includes('unique') || collError.includes('already')) {
            console.log('[Document AI] Collection may exist, retrying fetch...');
            const retryCollRes = await fetch(`${DOC_PROCESSOR_BASE}/collections?workspace=${workspaceId}`, {
              headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Accept': 'application/json',
              },
            });
            if (retryCollRes.ok) {
              const retryData = await retryCollRes.json();
              const retryList = Array.isArray(retryData) ? retryData : retryData.results;
              if (retryList && retryList.length > 0) {
                collectionId = retryList[0].identifier;
                console.log('[Document AI] Found collection on retry:', collectionId);
              }
            }
          }
          
          if (!collectionId) {
            return [];
          }
        }
      }
    }

    if (!collectionId) {
      console.error('[Document AI] ERROR: No collection ID available');
      return [];
    }

    console.log('[Document AI] Step 4: Uploading and analyzing document...');
    
    const uploadRes = await fetch(`${DOC_PROCESSOR_BASE}/documents`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        url: resumeUrl,
        collection: collectionId,
        wait: true,
      }),
    });

    console.log('[Document AI] Analysis response status:', uploadRes.status);

    if (!uploadRes.ok) {
      const uploadError = await uploadRes.text();
      console.error('[Document AI] ERROR analyzing document:', uploadError);
      return [];
    }

    const documentData: DocumentParserResponse = await uploadRes.json();
    console.log('[Document AI] Document processed, ID:', documentData.meta?.identifier);

    console.log('[Document AI] Step 5: Extracting skills from analysis...');
    
    const skills: string[] = [];

    const cleanSkillName = (name: string): string => {
      if (!name) return '';
      let cleaned = name
        .replace(/\s*\([^)]*\)/g, '')
        .replace(/\s*-\s*[A-Z].*$/g, '') 
        .replace(/\s*:\s*.*$/g, '')
        .replace(/\s*\/\s*.*$/g, '')
        .trim();
      
      if (cleaned.length > 30) {
        const parts = cleaned.split(/[,;|]/);
        cleaned = parts[0]?.trim() ?? cleaned;
      }
      
      if (cleaned.length > 40 || cleaned.length < 1) {
        return '';
      }
      
      return cleaned;
    };

    if (documentData.data?.skills) {
      console.log('[Document AI] Found skills array with', documentData.data.skills.length, 'items');
      documentData.data.skills.forEach((skill) => {
        const skillName = skill.name || skill.parsed || '';
        const cleaned = cleanSkillName(skillName);
        if (cleaned) {
          skills.push(cleaned);
        }
      });
    }

    if (documentData.data?.hardSkills) {
      console.log('[Document AI] Found hardSkills array with', documentData.data.hardSkills.length, 'items');
      documentData.data.hardSkills.forEach((skill) => {
        const cleaned = cleanSkillName(skill.name || '');
        if (cleaned) skills.push(cleaned);
      });
    }

    if (documentData.data?.softSkills) {
      console.log('[Document AI] Found softSkills array with', documentData.data.softSkills.length, 'items');
      documentData.data.softSkills.forEach((skill) => {
        const cleaned = cleanSkillName(skill.name || '');
        if (cleaned) skills.push(cleaned);
      });
    }

    const normalizedSkills = skills.map(s => normalizeSkill(s));
    const uniqueSkills = Array.from(new Set(normalizedSkills)).sort();

    console.log('[Document AI] SUCCESS: Extracted', uniqueSkills.length, 'unique skills');

    return uniqueSkills;

  } catch (error) {
    console.error('[Document AI] EXCEPTION during skill extraction:', error);
    return [];
  }
}

export async function uploadResume(formData: FormData): Promise<ResumeUploadResult> {
  console.log('[Resume Upload] Starting upload process...');
  
  try {
    console.log('[Resume Upload] Step 1: Verifying authentication...');
    const session = await getSession();
    
    if (!session) {
      console.error('[Resume Upload] ERROR: User not authenticated');
      return { success: false, error: 'Not authenticated' };
    }
    console.log('[Resume Upload] User authenticated:', session.uid);

    console.log('[Resume Upload] Step 2: Checking rate limit...');
    const rateLimitResult = await checkRateLimit(session.uid);
    
    if (!rateLimitResult.allowed) {
      console.log('[Resume Upload] Rate limit exceeded for user:', session.uid);
      return { success: false, error: rateLimitResult.error };
    }
    console.log('[Resume Upload] Rate limit OK. Remaining uploads:', rateLimitResult.remainingUploads);

    console.log('[Resume Upload] Step 3: Validating file...');
    const file = formData.get('file') as File;
    
    if (!file) {
      console.error('[Resume Upload] ERROR: No file provided');
      return { success: false, error: 'No file provided' };
    }
    
    console.log('[Resume Upload] File name:', file.name);
    console.log('[Resume Upload] File type:', file.type);
    console.log('[Resume Upload] File size:', file.size, 'bytes');

    if (file.type !== 'application/pdf') {
      console.error('[Resume Upload] ERROR: Invalid file type:', file.type);
      return { success: false, error: 'Only PDF files are allowed' };
    }

    if (file.size > 5 * 1024 * 1024) {
      console.error('[Resume Upload] ERROR: File too large:', file.size);
      return { success: false, error: 'File size must be less than 5MB' };
    }

    console.log('[Resume Upload] Step 4: Validating PDF content...');
    const contentValidation = await validatePdfContent(file);
    if (!contentValidation.valid) {
      console.error('[Resume Upload] ERROR: Invalid PDF content');
      return { success: false, error: contentValidation.error };
    }
    console.log('[Resume Upload] PDF content validation passed');

    console.log('[Resume Upload] Step 5: Computing file hash...');
    const fileHash = await getFileHash(file);
    console.log('[Resume Upload] File hash:', fileHash);

    console.log('[Resume Upload] Step 6: Checking skills cache...');
    let extractedSkills = await getCachedSkills(fileHash);
    const skillsFromCache = extractedSkills !== null;

    console.log('[Resume Upload] Step 7: Checking for existing resume...');
    const db = getAdminFirestore();
    const userDoc = await db.collection('users').doc(session.uid).get();
    const userData = userDoc.data();

    if (userData?.resumeUrl) {
      console.log('[Resume Upload] Found existing resume:', userData.resumeUrl);
      
      if (userData.resumeUrl.includes('vercel-storage.com') || userData.resumeUrl.includes('blob.vercel-storage.com')) {
        try {
          console.log('[Resume Upload] Deleting old resume from Vercel Blob...');
          await del(userData.resumeUrl);
          console.log('[Resume Upload] Old resume deleted successfully');
        } catch (deleteError) {
          console.error('[Resume Upload] WARNING: Failed to delete old resume:', deleteError);
        }
      } else {
        console.log('[Resume Upload] Old resume is not in Vercel Blob, skipping deletion');
      }
    }

    console.log('[Resume Upload] Step 8: Uploading to Vercel Blob...');
    const fileName = `resumes/${session.uid}_${Date.now()}_resume.pdf`;
    
    console.log('[Resume Upload] Target path:', fileName);
    console.log('[Resume Upload] BLOB_READ_WRITE_TOKEN exists:', !!process.env.BLOB_READ_WRITE_TOKEN);
    
    const blob = await put(fileName, file, {
      access: 'public',
    });

    console.log('[Resume Upload] Upload successful!');
    console.log('[Resume Upload] Blob URL:', blob.url);

    if (!skillsFromCache) {
      console.log('[Resume Upload] Step 9: Analyzing document with AI...');
      extractedSkills = await analyzeDocumentForSkills(blob.url);
      console.log('[Resume Upload] Extracted skills count:', extractedSkills.length);
      
      if (extractedSkills.length > 0) {
        await cacheSkills(fileHash, extractedSkills);
      }
    } else {
      console.log('[Resume Upload] Step 9: Using cached skills, count:', extractedSkills!.length);
    }

    console.log('[Resume Upload] Step 10: Clearing old skills and updating Firestore...');
    await db.collection('users').doc(session.uid).update({
      resumeUrl: blob.url,
      resumeUpdatedAt: new Date(),
      extractedSkills: extractedSkills || [],
      updatedAt: new Date(),
    });
    console.log('[Resume Upload] Firestore updated successfully');

    console.log('[Resume Upload] === UPLOAD COMPLETE ===');
    return { 
      success: true, 
      url: blob.url, 
      extractedSkills: extractedSkills || []
    };

  } catch (error) {
    console.error('[Resume Upload] FATAL ERROR:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload resume',
    };
  }
}

export async function updateSkills(skills: string[]): Promise<SkillUpdateResult> {
  console.log('[Update Skills] Starting...');
  
  try {
    const session = await getSession();
    if (!session) {
      console.error('[Update Skills] ERROR: Not authenticated');
      return { success: false, error: 'Not authenticated' };
    }

    const normalizedSkills = skills
      .map(s => s.trim())
      .filter(s => s.length > 0)
      .map(s => normalizeSkill(s));
    
    const uniqueSkills = [...new Set(normalizedSkills)];
    console.log('[Update Skills] Normalized skills count:', uniqueSkills.length);

    const db = getAdminFirestore();
    await db.collection('users').doc(session.uid).update({
      extractedSkills: uniqueSkills,
      updatedAt: new Date(),
    });

    console.log('[Update Skills] SUCCESS');
    return { success: true, skills: uniqueSkills };
  } catch (error) {
    console.error('[Update Skills] ERROR:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update skills',
    };
  }
}

export async function addSkill(skill: string): Promise<SkillUpdateResult> {
  console.log('[Add Skill] Adding:', skill);
  
  try {
    const session = await getSession();
    if (!session) {
      console.error('[Add Skill] ERROR: Not authenticated');
      return { success: false, error: 'Not authenticated' };
    }

    if (!skill.trim()) {
      console.error('[Add Skill] ERROR: Empty skill');
      return { success: false, error: 'Skill cannot be empty' };
    }

    const normalizedSkill = normalizeSkill(skill.trim());
    console.log('[Add Skill] Normalized to:', normalizedSkill);

    const db = getAdminFirestore();
    const userDoc = await db.collection('users').doc(session.uid).get();
    const userData = userDoc.data();

    const currentSkills: string[] = userData?.extractedSkills || [];
    
    if (currentSkills.includes(normalizedSkill)) {
      console.log('[Add Skill] Skill already exists');
      return { success: false, error: 'Skill already exists' };
    }

    const updatedSkills = [...currentSkills, normalizedSkill];

    await db.collection('users').doc(session.uid).update({
      extractedSkills: updatedSkills,
      updatedAt: new Date(),
    });

    console.log('[Add Skill] SUCCESS, total skills:', updatedSkills.length);
    return { success: true, skills: updatedSkills };
  } catch (error) {
    console.error('[Add Skill] ERROR:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add skill',
    };
  }
}

export async function removeSkill(skill: string): Promise<SkillUpdateResult> {
  console.log('[Remove Skill] Removing:', skill);
  
  try {
    const session = await getSession();
    if (!session) {
      console.error('[Remove Skill] ERROR: Not authenticated');
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

    console.log('[Remove Skill] SUCCESS, remaining skills:', updatedSkills.length);
    return { success: true, skills: updatedSkills };
  } catch (error) {
    console.error('[Remove Skill] ERROR:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to remove skill',
    };
  }
}

export async function deleteResume(): Promise<ResumeUploadResult> {
  console.log('[Delete Resume] Starting...');
  
  try {
    const session = await getSession();
    if (!session) {
      console.error('[Delete Resume] ERROR: Not authenticated');
      return { success: false, error: 'Not authenticated' };
    }

    const db = getAdminFirestore();
    const userDoc = await db.collection('users').doc(session.uid).get();
    const userData = userDoc.data();

    if (userData?.resumeUrl) {
      console.log('[Delete Resume] Found resume:', userData.resumeUrl);
      
      if (userData.resumeUrl.includes('vercel-storage.com') || userData.resumeUrl.includes('blob.vercel-storage.com')) {
        try {
          console.log('[Delete Resume] Deleting from Vercel Blob...');
          await del(userData.resumeUrl);
          console.log('[Delete Resume] Deleted from Vercel Blob');
        } catch (storageError) {
          console.error('[Delete Resume] WARNING: Failed to delete from storage:', storageError);
        }
      }
    }

    await db.collection('users').doc(session.uid).update({
      resumeUrl: null,
      resumeUpdatedAt: null,
      updatedAt: new Date(),
    });

    console.log('[Delete Resume] SUCCESS');
    return { success: true };
  } catch (error) {
    console.error('[Delete Resume] ERROR:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete resume',
    };
  }
}
