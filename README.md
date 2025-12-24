<p align="center">
  <img src="public/iips-logo.png" alt="IIPS Logo" width="120" height="120" />
</p>

<h1 align="center">🎓 IIPS Smart Placement Portal</h1>

<p align="center">
  <strong>A Modern, AI-Powered Campus Placement Management System</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#screenshots">Screenshots</a> •
  <a href="#installation">Installation</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#api-reference">API Reference</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.1.1-black?logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19.0.0-blue?logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.6-blue?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Firebase-11.0-orange?logo=firebase" alt="Firebase" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?logo=tailwind-css" alt="TailwindCSS" />
</p>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Screenshots & Screen Descriptions](#-screenshots--screen-descriptions)
- [User Roles & Permissions](#-user-roles--permissions)
- [Workflow & Sequence Diagrams](#-workflow--sequence-diagrams)
- [Database Schema](#-database-schema)
- [Installation & Setup](#-installation--setup)
- [Environment Variables](#-environment-variables)
- [Scripts & Commands](#-scripts--commands)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

**IIPS Smart Placement Portal** is a comprehensive campus placement management system designed specifically for the **International Institute of Professional Studies (IIPS)**, Devi Ahilya Vishwavidyalaya (DAVV), Indore. 

The platform streamlines the entire placement process by connecting students, Training & Placement Officers (TPO), and administrators in a unified digital ecosystem. With AI-powered features like automatic resume parsing and intelligent skill extraction, students can focus on preparation while the system handles the administrative overhead.

### 🎯 Key Objectives

- **Digitize** the entire placement workflow from registration to offer acceptance
- **Automate** eligibility checking based on CGPA, backlogs, and tier policies
- **Simplify** application tracking for students and administration
- **Provide** real-time analytics and insights for decision making
- **Ensure** fair and transparent placement process with Dream Offer Policy

---

## ✨ Features

### 👨‍🎓 For Students

| Feature | Description |
|---------|-------------|
| **One-Click Registration** | Sign up using Google authentication with IIPS email |
| **Smart Profile Builder** | Auto-parsing of roll number to extract program, batch, and year details |
| **AI Resume Parser** | Upload PDF resume and automatically extract skills using NLP |
| **Skill Management** | Add, edit, or remove skills with intelligent normalization |
| **Drive Discovery** | Browse all available placement drives with eligibility indicators |
| **One-Click Apply** | Apply to eligible drives instantly with pre-filled details |
| **Application Tracker** | Track status from Applied → Shortlisted → Rounds → Selected |
| **Profile Dashboard** | View placement status, offers, and profile completion |

### 👔 For TPO/Admin

| Feature | Description |
|---------|-------------|
| **Drive Management** | Create, edit, publish, and manage placement drives |
| **Company Database** | Maintain company profiles with industry and package details |
| **Student Management** | View all students, filter by program, batch, CGPA |
| **Application Processing** | Shortlist, advance rounds, select, or reject applications |
| **Bulk Operations** | Export data to Excel, bulk status updates |
| **User Management** | Manage TPO accounts and admin privileges |
| **Analytics Dashboard** | Real-time placement statistics and insights |

### 🔐 Platform Features

| Feature | Description |
|---------|-------------|
| **Dream Offer Policy** | Automatic tier management (Regular → Dream → Super Dream) |
| **Role-Based Access** | Separate interfaces for Student, TPO, and Admin |
| **Secure Authentication** | Firebase Auth with session-based JWT tokens |
| **Responsive Design** | Works seamlessly on desktop, tablet, and mobile |
| **Real-time Updates** | Instant status updates via Firestore listeners |

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **Next.js 16** | React framework with App Router & Server Actions |
| **React 19** | UI library with latest concurrent features |
| **TypeScript** | Type-safe development |
| **Tailwind CSS** | Utility-first styling |
| **Radix UI** | Accessible component primitives |
| **Framer Motion** | Smooth animations and transitions |
| **Lucide Icons** | Modern icon library |

### Backend
| Technology | Purpose |
|------------|---------|
| **Next.js Server Actions** | Server-side mutations and data fetching |
| **Firebase Admin SDK** | Server-side Firebase operations |
| **Zod** | Schema validation |

### Database & Auth
| Technology | Purpose |
|------------|---------|
| **Firebase Firestore** | NoSQL document database |
| **Firebase Auth** | Authentication with Google OAuth |
| **Firebase Storage** | Resume and document storage |

### AI & Processing
| Technology | Purpose |
|------------|---------|
| **pdf-parse** | PDF text extraction |
| **Pattern Matching** | Skill extraction from resume text |

### DevOps & Tools
| Technology | Purpose |
|------------|---------|
| **pnpm** | Fast, disk-efficient package manager |
| **ESLint** | Code linting |
| **tsx** | TypeScript execution for scripts |

---

## 📁 Project Structure

```
IIPS_Placement_Portal/
├── public/                     # Static assets (logos, images)
├── scripts/                    # CLI scripts for seeding and management
│   ├── seed-students.ts        # Generate test student data
│   ├── seed-drives.ts          # Generate test placement drives
│   ├── seed-companies.ts       # Generate test company data
│   ├── seed-applications.ts    # Generate test applications
│   ├── update-role.ts          # Update user roles
│   ├── set-custom-claims.ts    # Set Firebase custom claims
│   └── flush-database.ts       # Clear all collections
├── src/
│   ├── actions/                # Server Actions (business logic)
│   │   ├── auth.ts             # Authentication actions
│   │   ├── admin.ts            # Admin/TPO operations
│   │   ├── placement.ts        # Drive & application actions
│   │   └── resume.ts           # Resume upload & parsing
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx            # Landing page (animated)
│   │   ├── login/              # Student/Admin login
│   │   ├── signup/             # New user registration
│   │   ├── onboarding/         # Profile completion wizard
│   │   ├── dashboard/          # Student dashboard
│   │   ├── drives/             # Browse & view drives
│   │   ├── applications/       # Track applications
│   │   ├── profile/            # Edit profile & resume
│   │   └── admin/              # Admin panel
│   │       ├── page.tsx        # Admin dashboard
│   │       ├── drives/         # Manage drives
│   │       ├── students/       # Manage students
│   │       ├── companies/      # Manage companies
│   │       ├── applications/   # Process applications
│   │       ├── users/          # Manage TPO/Admin users
│   │       └── analytics/      # Placement analytics
│   ├── components/             # Reusable UI components
│   │   ├── ui/                 # Base UI components (Button, Card, etc.)
│   │   └── layout/             # Layout components (Navbar, Sidebar)
│   ├── lib/                    # Utility libraries
│   │   ├── firebase/           # Firebase client & admin setup
│   │   ├── iips/               # IIPS-specific utilities
│   │   │   └── roll-parser.ts  # Roll number parser
│   │   └── utils.ts            # General utilities
│   ├── types/                  # TypeScript type definitions
│   │   └── schema.ts           # Database schema types
│   └── middleware.ts           # Route protection middleware
├── .env.example                # Environment variables template
├── SETUP_GUIDE.md              # Detailed setup instructions
├── package.json                # Project dependencies
├── tailwind.config.ts          # Tailwind configuration
├── tsconfig.json               # TypeScript configuration
└── next.config.ts              # Next.js configuration
```

---

## 📸 Screenshots & Screen Descriptions

> **Note:** Add your screenshots in the `screenshots/` folder and update the paths below.

### 1. Landing Page (`/`)

<img src="/webp/landing.webp" alt="Landing Page" width="100%"/>

**Description:**  
The animated landing page serves as the entry point to the portal. It showcases:
- **Hero Section**: Welcoming message with call-to-action buttons for Login/Signup
- **Statistics Counter**: Animated counters displaying placement highlights (Companies Visited, Students Placed, Highest Package, Average Package)
- **Features Grid**: Six key features with animated cards (AI Resume Parser, Smart Eligibility, Real-time Notifications, One-Click Applications, Application Tracking, Skill Matching)
- **Smooth Animations**: Framer Motion powered fade-ins, scale effects, and hover interactions

**User Actions:**
- Click "Login" to access the login page
- Click "Get Started" to navigate to signup
- Scroll to explore features and statistics

---

### 2. Login Page (`/login`)

<img src="/webp/login.webp" alt="Login Page" width="100%"/>

**Description:**  
A clean, tabbed login interface supporting multiple authentication methods:
- **Google Sign-In**: One-click authentication with Google account
- **Email/Password**: Traditional login for existing users
- **Tab Navigation**: Switch between Google and Email login methods
- **Error Handling**: Toast notifications for invalid credentials or authentication failures

**User Actions:**
- Click "Sign in with Google" for OAuth login
- Enter email and password for credential-based login
- Click "Forgot Password?" to reset password
- Click "Sign Up" to create a new account

---

### 3. Signup Page (`/signup`)

<img src="/webp/signup.webp" alt="Signup Page" width="100%"/>

**Description:**  
New user registration page with:
- **Google Sign-Up**: Recommended method for IIPS students (uses institute email)
- **Email Registration**: Alternative method with password creation
- **Validation**: Real-time form validation with error messages
- **Terms Acceptance**: Checkbox for accepting terms and conditions

**User Actions:**
- Sign up with Google (recommended)
- Fill in email, password, and confirm password
- Accept terms and conditions
- Submit registration form

---

### 4. Onboarding Page (`/onboarding`)

<img src="/webp/onboarding.webp" alt="Onboarding Page" width="100%"/>

**Description:**  
A comprehensive profile completion wizard that collects essential student information:

**Step 1 - Basic Information:**
- Full Name
- Roll Number (auto-parsed for program/batch details)
- Phone Number
- Gender Selection
- Date of Birth

**Step 2 - Address Details:**
- Address Line 1 & 2
- City, State, Pincode

**Step 3 - Academic Information:**
- CGPA
- Active Backlogs
- 10th Percentage, Board, Year
- 12th Percentage, Board, Year

**Smart Features:**
- **Roll Number Parser**: Automatically extracts program code, admission year, and batch from roll number format (e.g., `IC-2K22-45` → MCA Integrated, 2022 batch)
- **Progress Indicator**: Visual progress bar showing completion status
- **Validation**: Real-time validation with helpful error messages

**User Actions:**
- Fill in all required fields
- Roll number auto-parses program details
- Submit to complete profile and access dashboard

---

### 5. Student Dashboard (`/dashboard`)

<img src="/webp/student_dashboard.webp" alt="Student Dashboard" width="100%"/>

**Description:**  
The main hub for students showing personalized placement information:

**Sections:**
- **Welcome Banner**: Personalized greeting with profile photo
- **Placement Status Card**: Current placement tier, offers received, eligibility status
- **Quick Stats**: Total applications, shortlisted, selected, pending
- **Open Drives**: List of currently accepting applications with eligibility indicators
- **Recent Applications**: Latest application statuses with quick links
- **Profile Completion**: Progress bar showing profile completeness

**Key Information Displayed:**
- Current placement tier (Regular/Dream/Super Dream)
- Number of active offers
- Upcoming drive deadlines
- Application status summary

**User Actions:**
- Click on a drive to view details and apply
- Navigate to "View All Drives" for complete list
- Click on applications to track status
- Update profile from the profile section

---

### 6. Browse Drives (`/drives`)

<img src="/webp/drives.webp" alt="Browse Drives" width="100%"/>

**Description:**  
A searchable, filterable list of all placement drives:

**Features:**
- **Search Bar**: Search by company name, job title, or skills
- **Filters**: Filter by status (Open/Upcoming/Closed), tier, package range
- **Drive Cards**: Each card shows:
  - Company logo and name
  - Job title and location
  - Package (LPA) with tier badge
  - Application deadline
  - Eligibility status (Eligible/Not Eligible with reason)
  - Applicant count
- **Sort Options**: Sort by deadline, package, or date posted

**Eligibility Indicators:**
- ✅ **Green Badge**: Eligible to apply
- ❌ **Red Badge**: Not eligible (shows reason: CGPA, Backlogs, Already Placed, etc.)

**User Actions:**
- Search for specific companies or roles
- Apply filters to narrow down options
- Click on a drive card to view full details
- Apply to eligible drives directly

---

### 7. Drive Details (`/drives/[id]`)

<img src="/webp/drivesid.webp" alt="Drive Details" width="100%"/>

**Description:**  
Comprehensive information about a specific placement drive:

**Information Sections:**
- **Company Header**: Logo, name, industry, website link
- **Job Details**: Title, description, work location, remote status
- **Package Information**: CTC breakdown, stipend (if internship)
- **Eligibility Criteria**: Min CGPA, allowed backlogs, allowed programs, custom criteria
- **Selection Process**: Round-wise breakdown (Aptitude, Coding, Technical, HR, etc.)
- **Timeline**: Application deadline, drive date, important dates
- **Documents**: Attached JD, brochure downloads

**Application Section:**
- **Eligibility Check**: Real-time check against your profile
- **Apply Button**: One-click application submission
- **Application Status**: If already applied, shows current status

**User Actions:**
- Review complete drive information
- Download attached documents
- Check eligibility against your profile
- Apply if eligible (requires uploaded resume)
- Withdraw application if needed

---

### 8. My Applications (`/applications`)

<img src="/webp/my_application.webp" alt="My Applications" width="100%"/>

**Description:**  
Track all your placement applications in one place:

**Application Card Information:**
- Company name and logo
- Job title and package
- Application date
- Current status with colored badge
- Round progress (if shortlisted)

**Status Types:**
| Status | Color | Description |
|--------|-------|-------------|
| Applied | Blue | Application submitted |
| Shortlisted | Yellow | Selected for further rounds |
| Round-1/2/3 | Purple | Currently in interview round |
| Selected | Green | Received offer |
| Rejected | Red | Not selected |
| Withdrawn | Gray | Self-withdrawn |

**Features:**
- **Filter by Status**: View only specific status applications
- **Timeline View**: See progression through rounds
- **Offer Details**: View offer letter if selected

**User Actions:**
- Filter applications by status
- Click to view detailed application status
- Accept/Decline offers (if selected)
- Withdraw pending applications

---

### 9. Profile Page (`/profile`)

<img src="/webp/profile.webp" alt="Profile Page" width="100%"/>

**Description:**  
View and edit your complete profile:

**Sections:**

**Personal Information:**
- Full name, email, phone
- Roll number (read-only)
- Program and batch details
- Profile photo

**Academic Details:**
- CGPA and backlog count
- 10th and 12th scores
- Semester-wise SGPA (if available)

**Resume Section:**
- Current resume preview
- Upload new resume (PDF only, max 5MB)
- Last updated timestamp

**Skills Section:**
- AI-extracted skills from resume
- Add custom skills
- Remove irrelevant skills
- Skill normalization (e.g., "nodejs" → "Node.js")

**Placement Status:**
- Current tier eligibility
- Offers received
- Debarment status (if any)

**User Actions:**
- Edit editable fields (phone, address, CGPA)
- Upload/replace resume
- Manage skills (add/remove)
- View placement eligibility

---

### 10. Admin Dashboard (`/admin`)

<img src="/webp/admin_dashboard.webp" alt="Admin Dashboard" width="100%"/>

**Description:**  
Central hub for TPO and Admin users:

**Quick Stats Cards:**
- Total Students
- Active Drives
- Pending Applications
- Total Placements

**Recent Activity:**
- Latest applications received
- Recent drive updates
- New student registrations

**Quick Actions:**
- Create New Drive
- View All Applications
- Export Reports

**Navigation Sidebar:**
- Dashboard (overview)
- Drives (manage drives)
- Students (student directory)
- Companies (company database)
- Applications (process applications)
- Users (manage TPO/Admins)
- Analytics (detailed reports)

**User Actions:**
- Navigate to different admin sections
- View recent activities
- Access quick action buttons
- Monitor real-time statistics

---

### 11. Manage Drives (`/admin/drives`)

<img src="/webp/manage_drives.webp" alt="Manage Drives" width="100%"/>

**Description:**  
Complete drive management interface:

**Drive List:**
- All drives with status badges
- Applicant and selection counts
- Quick action buttons

**Drive Actions:**
| Action | Description |
|--------|-------------|
| View | See full drive details |
| Edit | Modify drive information |
| Publish | Make draft drive live |
| Close | Stop accepting applications |
| Delete | Remove drive (draft only) |

**Create New Drive:**
- Multi-step form wizard
- Company selection or new company creation
- Eligibility criteria builder
- Round configuration
- Document upload

**User Actions:**
- View/Edit/Delete existing drives
- Create new placement drive
- Change drive status (publish/close)
- View applications for specific drive

---

### 12. Create Drive (`/admin/drives/new`)

<img src="/webp/create_drives.webp" alt="Create Drive" width="100%"/>

**Description:**  
Comprehensive drive creation wizard:

**Step 1 - Company Details:**
- Select existing company or create new
- Company name, industry, website
- Company logo upload

**Step 2 - Job Details:**
- Job title and description
- Job type (Full-time/Internship/PPO)
- Work location and remote option
- Package details (CTC, breakdown, stipend)
- Tier selection (Regular/Dream/Super Dream)

**Step 3 - Eligibility Criteria:**
- Minimum CGPA requirement
- Maximum allowed backlogs
- Allowed programs (multi-select)
- Allowed batches
- 10th/12th percentage requirements
- Custom eligibility criteria

**Step 4 - Selection Process:**
- Add interview rounds
- Round type (Aptitude, Coding, Technical, HR, GD)
- Round details (date, venue, online/offline)

**Step 5 - Timeline:**
- Application deadline
- Drive date
- Publish settings (draft/immediate/scheduled)

**User Actions:**
- Fill in all drive details step by step
- Preview before publishing
- Save as draft or publish immediately

---

### 13. Student Management (`/admin/students`)

<img src="/webp/manage_students.webp" alt="Student Management" width="100%"/>

**Description:**  
Complete student directory with advanced filtering:

**Student Table:**
- Profile photo, name, roll number
- Program and batch
- CGPA and backlog count
- Placement status
- Quick action buttons

**Filters:**
- Program/Department
- Batch/Admission Year
- CGPA Range
- Placement Status (Placed/Unplaced)
- Search by name/roll number

**Bulk Actions:**
- Export to Excel
- Send bulk notifications
- Update eligibility status

**Student Detail View:**
- Complete profile information
- Application history
- Offer details (if placed)
- Debarment option

**User Actions:**
- Search and filter students
- View individual student profiles
- Export student data
- Manage student placement status
- Debarred students if policy violated

---

### 14. Application Processing (`/admin/applications`)

<img src="/webp/manange_applications.webp" alt="Application Processing" width="100%"/>

**Description:**  
Process and manage all placement applications:

**Application Table:**
- Student details (name, roll, CGPA)
- Company and position
- Current status
- Applied date
- Action buttons

**Status Workflow:**
```
Applied → Shortlisted → Round 1 → Round 2 → Round 3 → Selected
                                                   ↓
                                               Rejected
```

**Bulk Operations:**
- Shortlist multiple students
- Advance to next round
- Export shortlist to Excel

**Application Detail:**
- Student resume view
- Round-wise results
- Interview scheduling
- Offer letter upload

**User Actions:**
- Filter by drive, status, or student
- Shortlist applications
- Update round results
- Mark selected/rejected
- Upload offer letters

---

### 15. Company Management (`/admin/companies`)

<img src="/webp/manage_companies.webp" alt="Company Management" width="100%"/>

**Description:**  
Maintain company database:

**Company Card:**
- Logo and name
- Industry category
- Number of drives conducted
- Students placed

**Company Details:**
- Contact information
- Previous drive history
- Average package offered
- Feedback and ratings

**User Actions:**
- Add new company
- Edit company details
- View drive history
- Delete company (no associated drives)

---

### 16. User Management (`/admin/users`)

<img src="/webp/manage_user.webp" alt="User Management" width="100%"/>

**Description:**  
Manage TPO and Admin accounts (Admin only):

**User List:**
- Name and email
- Role (Admin/TPO)
- Created date
- Last active

**Role Capabilities:**
| Permission | Admin | TPO |
|------------|-------|-----|
| Manage Drives | ✅ | ✅ |
| Process Applications | ✅ | ✅ |
| View Students | ✅ | ✅ |
| Manage Companies | ✅ | ✅ |
| Manage TPO Users | ✅ | ❌ |
| View Analytics | ✅ | ✅ |
| System Settings | ✅ | ❌ |

**User Actions:**
- Create new TPO account
- Change user role
- Deactivate user account
- Reset user password

---

### 17. Analytics Dashboard (`/admin/analytics`)

<img src="/webp/analytics.webp" alt="Analytics Dashboard" width="100%"/>

**Description:**  
Comprehensive placement analytics and insights:

**Key Metrics:**
- Total Placements vs Target
- Average Package
- Highest Package
- Placement Percentage

**Charts & Visualizations:**
- Placements by Program (Pie Chart)
- Package Distribution (Histogram)
- Month-wise Placement Trend (Line Chart)
- Company-wise Selection (Bar Chart)

**Exportable Reports:**
- Complete placement report
- Unplaced students list
- Drive-wise analysis
- Program-wise statistics

**User Actions:**
- View real-time analytics
- Filter by date range
- Export reports to Excel/PDF
- Compare year-over-year data

---

## 👥 User Roles & Permissions

### Role Hierarchy

```
┌─────────────────────────────────────────────────────────┐
│                        ADMIN                            │
│  • Full system access                                   │
│  • User management (create/edit TPO accounts)           │
│  • System configuration                                 │
│  • All TPO permissions                                  │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                         TPO                             │
│  • Drive management (create/edit/publish)               │
│  • Application processing (shortlist/select/reject)     │
│  • Student management (view/export)                     │
│  • Company management                                   │
│  • Analytics (view/export)                              │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                       STUDENT                           │
│  • View open drives                                     │
│  • Apply to eligible drives                             │
│  • Track applications                                   │
│  • Manage profile and resume                            │
│  • View offers                                          │
└─────────────────────────────────────────────────────────┘
```

### Permission Matrix

| Action | Student | TPO | Admin |
|--------|---------|-----|-------|
| View Open Drives | ✅ | ✅ | ✅ |
| Apply to Drives | ✅ | ❌ | ❌ |
| Create Drives | ❌ | ✅ | ✅ |
| Edit Drives | ❌ | ✅ | ✅ |
| Delete Drives | ❌ | ✅ | ✅ |
| View All Students | ❌ | ✅ | ✅ |
| Process Applications | ❌ | ✅ | ✅ |
| Manage Companies | ❌ | ✅ | ✅ |
| Manage Users | ❌ | ❌ | ✅ |
| View Analytics | ❌ | ✅ | ✅ |

---

## 🔄 Workflow & Sequence Diagrams

> **Note:** Add your diagrams in the `diagrams/` folder and update the paths below.

### 1. Student Registration & Onboarding Flow

![Registration Flow](diagrams/registration-flow.png)

```
┌──────────┐     ┌───────────┐     ┌──────────────┐     ┌───────────┐
│  Student │     │   Login   │     │  Firebase    │     │ Firestore │
│          │     │   Page    │     │    Auth      │     │           │
└────┬─────┘     └─────┬─────┘     └──────┬───────┘     └─────┬─────┘
     │                 │                   │                   │
     │  Click Google   │                   │                   │
     │  Sign In        │                   │                   │
     │────────────────>│                   │                   │
     │                 │                   │                   │
     │                 │  OAuth Request    │                   │
     │                 │──────────────────>│                   │
     │                 │                   │                   │
     │                 │  ID Token         │                   │
     │                 │<──────────────────│                   │
     │                 │                   │                   │
     │                 │  Create Session   │                   │
     │                 │──────────────────>│                   │
     │                 │                   │                   │
     │                 │  Check User Doc   │                   │
     │                 │───────────────────────────────────────>
     │                 │                   │                   │
     │                 │  User Not Found   │                   │
     │                 │<───────────────────────────────────────
     │                 │                   │                   │
     │  Redirect to    │                   │                   │
     │  Onboarding     │                   │                   │
     │<────────────────│                   │                   │
     │                 │                   │                   │
     │  Submit Profile │                   │                   │
     │────────────────>│                   │                   │
     │                 │                   │                   │
     │                 │  Set Custom       │                   │
     │                 │  Claims           │                   │
     │                 │──────────────────>│                   │
     │                 │                   │                   │
     │                 │  Save User Doc    │                   │
     │                 │───────────────────────────────────────>
     │                 │                   │                   │
     │  Redirect to    │                   │                   │
     │  Dashboard      │                   │                   │
     │<────────────────│                   │                   │
     │                 │                   │                   │
```

---

### 2. Drive Application Flow

![Application Flow](diagrams/application-flow.png)

```
┌──────────┐     ┌───────────┐     ┌──────────────┐     ┌───────────┐
│  Student │     │   Drive   │     │   Server     │     │ Firestore │
│          │     │   Page    │     │   Action     │     │           │
└────┬─────┘     └─────┬─────┘     └──────┬───────┘     └─────┬─────┘
     │                 │                   │                   │
     │  Click Apply    │                   │                   │
     │────────────────>│                   │                   │
     │                 │                   │                   │
     │                 │  applyToDrive()   │                   │
     │                 │──────────────────>│                   │
     │                 │                   │                   │
     │                 │                   │  Get Session      │
     │                 │                   │──────────────────>│
     │                 │                   │                   │
     │                 │                   │  Verify Role      │
     │                 │                   │  = Student        │
     │                 │                   │<──────────────────│
     │                 │                   │                   │
     │                 │                   │  Get Student      │
     │                 │                   │  Profile          │
     │                 │                   │──────────────────>│
     │                 │                   │                   │
     │                 │                   │  Get Drive        │
     │                 │                   │  Details          │
     │                 │                   │──────────────────>│
     │                 │                   │                   │
     │                 │                   │  Check            │
     │                 │                   │  Eligibility      │
     │                 │                   │                   │
     │                 │                   │  ✓ CGPA           │
     │                 │                   │  ✓ Backlogs       │
     │                 │                   │  ✓ Program        │
     │                 │                   │  ✓ Tier           │
     │                 │                   │                   │
     │                 │                   │  Create           │
     │                 │                   │  Application      │
     │                 │                   │──────────────────>│
     │                 │                   │                   │
     │                 │                   │  Update Student   │
     │                 │                   │  appliedDrives[]  │
     │                 │                   │──────────────────>│
     │                 │                   │                   │
     │                 │                   │  Update Drive     │
     │                 │                   │  applicantCount   │
     │                 │                   │──────────────────>│
     │                 │                   │                   │
     │                 │  Success Response │                   │
     │                 │<──────────────────│                   │
     │                 │                   │                   │
     │  Show Success   │                   │                   │
     │  Toast          │                   │                   │
     │<────────────────│                   │                   │
     │                 │                   │                   │
```

---

### 3. Dream Offer Policy Flow

![Dream Offer Policy](diagrams/dream-offer-policy.png)

```
┌─────────────────────────────────────────────────────────────────┐
│                    DREAM OFFER POLICY                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  TIER DEFINITIONS:                                              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Regular    : Package < 10 LPA                           │   │
│  │ Dream      : 10 LPA ≤ Package < 20 LPA                  │   │
│  │ Super Dream: Package ≥ 20 LPA                           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ELIGIBILITY RULES:                                             │
│                                                                 │
│  ┌─────────────┐                                                │
│  │  Unplaced   │                                                │
│  │  Student    │                                                │
│  └──────┬──────┘                                                │
│         │                                                       │
│         ▼                                                       │
│  ┌─────────────────────────────────────┐                       │
│  │ Can apply to: Regular, Dream,       │                       │
│  │               Super Dream           │                       │
│  └──────────────────┬──────────────────┘                       │
│                     │                                           │
│         ┌───────────┼───────────┐                              │
│         ▼           ▼           ▼                              │
│    ┌─────────┐ ┌─────────┐ ┌─────────────┐                     │
│    │ Gets    │ │ Gets    │ │ Gets Super  │                     │
│    │ Regular │ │ Dream   │ │ Dream Offer │                     │
│    │ Offer   │ │ Offer   │ │             │                     │
│    └────┬────┘ └────┬────┘ └──────┬──────┘                     │
│         │           │             │                             │
│         ▼           ▼             ▼                             │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐                  │
│  │ Can still  │ │ Can only   │ │ Placement  │                  │
│  │ apply to:  │ │ apply to:  │ │ Complete   │                  │
│  │ Dream,     │ │ Super Dream│ │            │                  │
│  │ Super Dream│ │            │ │ No more    │                  │
│  └────────────┘ └────────────┘ │ applications│                  │
│                                └────────────┘                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

### 4. Application Processing Flow (Admin)

![Application Processing](diagrams/application-processing.png)

```
┌─────────┐    ┌─────────────┐    ┌──────────┐    ┌───────────┐
│  Admin  │    │ Applications│    │  Server  │    │ Firestore │
│         │    │    Page     │    │  Action  │    │           │
└────┬────┘    └──────┬──────┘    └────┬─────┘    └─────┬─────┘
     │                │                 │                │
     │  View Apps     │                 │                │
     │───────────────>│                 │                │
     │                │                 │                │
     │                │  getAllApps()   │                │
     │                │────────────────>│                │
     │                │                 │                │
     │                │                 │  Query Apps    │
     │                │                 │───────────────>│
     │                │                 │                │
     │                │  App List       │                │
     │                │<────────────────│                │
     │                │                 │                │
     │  Display Apps  │                 │                │
     │<───────────────│                 │                │
     │                │                 │                │
     │                │                 │                │
     │  Shortlist     │                 │                │
     │  Students      │                 │                │
     │───────────────>│                 │                │
     │                │                 │                │
     │                │ updateStatus()  │                │
     │                │────────────────>│                │
     │                │                 │                │
     │                │                 │  Update App    │
     │                │                 │  status =      │
     │                │                 │  'shortlisted' │
     │                │                 │───────────────>│
     │                │                 │                │
     │                │                 │  Update Drive  │
     │                │                 │  shortlisted   │
     │                │                 │  Count         │
     │                │                 │───────────────>│
     │                │                 │                │
     │  Success       │                 │                │
     │<───────────────│                 │                │
     │                │                 │                │
     ├────────────────┼─────────────────┼────────────────┤
     │    REPEAT FOR EACH ROUND         │                │
     ├────────────────┼─────────────────┼────────────────┤
     │                │                 │                │
     │  Mark Selected │                 │                │
     │───────────────>│                 │                │
     │                │                 │                │
     │                │ selectStudent() │                │
     │                │────────────────>│                │
     │                │                 │                │
     │                │                 │  Update App    │
     │                │                 │  status =      │
     │                │                 │  'selected'    │
     │                │                 │───────────────>│
     │                │                 │                │
     │                │                 │  Update        │
     │                │                 │  Student       │
     │                │                 │  placementStat │
     │                │                 │───────────────>│
     │                │                 │                │
     │                │                 │  Update Drive  │
     │                │                 │  selectedCount │
     │                │                 │───────────────>│
     │                │                 │                │
     │  Success       │                 │                │
     │<───────────────│                 │                │
```

---

### 5. Resume Upload & Skill Extraction Flow

![Resume Processing](diagrams/resume-processing.png)

```
┌──────────┐     ┌───────────┐     ┌──────────────┐     ┌───────────┐
│  Student │     │  Profile  │     │   Server     │     │ Firestore │
│          │     │   Page    │     │   Action     │     │           │
└────┬─────┘     └─────┬─────┘     └──────┬───────┘     └─────┬─────┘
     │                 │                   │                   │
     │  Upload PDF     │                   │                   │
     │────────────────>│                   │                   │
     │                 │                   │                   │
     │                 │  uploadResume()   │                   │
     │                 │──────────────────>│                   │
     │                 │                   │                   │
     │                 │                   │  Validate File    │
     │                 │                   │  (PDF, <5MB)      │
     │                 │                   │                   │
     │                 │                   │  Save to Server   │
     │                 │                   │  /uploads/resumes │
     │                 │                   │                   │
     │                 │                   │  ┌─────────────┐  │
     │                 │                   │  │ pdf-parse   │  │
     │                 │                   │  │ Extract Text│  │
     │                 │                   │  └──────┬──────┘  │
     │                 │                   │         │         │
     │                 │                   │  ┌──────▼──────┐  │
     │                 │                   │  │ Skill       │  │
     │                 │                   │  │ Extraction  │  │
     │                 │                   │  │ (Patterns)  │  │
     │                 │                   │  └──────┬──────┘  │
     │                 │                   │         │         │
     │                 │                   │  ┌──────▼──────┐  │
     │                 │                   │  │ Normalize   │  │
     │                 │                   │  │ Skills      │  │
     │                 │                   │  │ js→JavaScript│ │
     │                 │                   │  └─────────────┘  │
     │                 │                   │                   │
     │                 │                   │  Update User Doc  │
     │                 │                   │  - resumeUrl      │
     │                 │                   │  - extractedSkills│
     │                 │                   │──────────────────>│
     │                 │                   │                   │
     │                 │  Success +        │                   │
     │                 │  Extracted Skills │                   │
     │                 │<──────────────────│                   │
     │                 │                   │                   │
     │  Display Skills │                   │                   │
     │  for Review     │                   │                   │
     │<────────────────│                   │                   │
     │                 │                   │                   │
     │  Add/Remove     │                   │                   │
     │  Skills         │                   │                   │
     │────────────────>│                   │                   │
     │                 │                   │                   │
     │                 │  updateSkills()   │                   │
     │                 │──────────────────>│                   │
     │                 │                   │                   │
```

---

## 🗃️ Database Schema

### Collections Overview

```
firestore/
├── users/                 # User profiles (students, TPO, admin)
├── drives/                # Placement drives
├── applications/          # Student applications
├── companies/             # Company database
└── config/                # System configuration
    └── eligibility        # Global eligibility rules
```

### User Document Structure

```typescript
interface UserProfile {
  // Identity
  uid: string;                    // Firebase UID
  email: string;
  emailVerified: boolean;
  photoURL?: string;
  role: 'student' | 'tpo' | 'admin';
  
  // Personal
  fullName: string;
  rollNumber: string;             // e.g., "IC-2K22-45"
  gender: 'male' | 'female' | 'other';
  dateOfBirth: Date;
  phone: string;
  address: {
    line1: string;
    city: string;
    state: string;
    pincode: string;
  };
  
  // Academic
  programCode: string;            // e.g., "MCA_INT"
  programName: string;            // e.g., "MCA (Integrated)"
  department: string;
  admissionYear: number;
  passingYear: number;
  batch: string;                  // e.g., "2022-2028"
  cgpa: number;
  activeBacklogs: number;
  tenthPercentage: number;
  twelfthPercentage: number;
  
  // Placement
  placementStatus: {
    isPlaced: boolean;
    currentTier: 'regular' | 'dream' | 'superDream' | null;
    offers: PlacedOffer[];
    isDebarred: boolean;
  };
  appliedDrives: string[];        // Array of drive IDs
  
  // Resume & Skills
  resumeUrl?: string;
  extractedSkills?: string[];
  
  // Metadata
  isProfileComplete: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Drive Document Structure

```typescript
interface PlacementDrive {
  id: string;
  
  // Company
  companyId: string;
  companyName: string;
  companyLogo?: string;
  industry: string;
  
  // Job
  jobTitle: string;
  jobDescription: string;
  jobType: 'full-time' | 'internship' | 'ppo';
  workLocation: string;
  isRemote: boolean;
  
  // Package
  tier: 'regular' | 'dream' | 'superDream';
  packageLPA: number;
  stipendPerMonth?: number;
  
  // Eligibility
  eligibility: {
    minCGPA: number;
    maxBacklogs?: number;
    allowedPrograms: string[];
    allowedBatches?: string[];
  };
  
  // Process
  rounds: DriveRound[];
  applicationDeadline: Date;
  status: 'draft' | 'upcoming' | 'open' | 'closed' | 'completed';
  
  // Stats
  applicantCount: number;
  shortlistedCount: number;
  selectedCount: number;
  
  // Metadata
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Application Document Structure

```typescript
interface Application {
  id: string;                     // "{driveId}_{studentId}"
  driveId: string;
  studentId: string;
  
  // Denormalized Student Info
  studentName: string;
  studentRollNumber: string;
  studentEmail: string;
  studentCGPA: number;
  studentProgram: string;
  
  // Denormalized Drive Info
  companyName: string;
  packageLPA: number;
  tier: 'regular' | 'dream' | 'superDream';
  
  // Status
  status: 'applied' | 'shortlisted' | 'round-1' | 'round-2' | 
          'round-3' | 'selected' | 'rejected' | 'withdrawn';
  currentRound?: string;
  roundResults: ApplicationRoundResult[];
  
  // Resume at Application Time
  resumeUrl: string;
  
  // Final Outcome
  offerPackageLPA?: number;
  offerLetterUrl?: string;
  offerAccepted?: boolean;
  
  // Metadata
  appliedAt: Date;
  updatedAt: Date;
}
```

---

## 🚀 Installation & Setup

### Prerequisites

- **Node.js** ≥ 20.0.0
- **pnpm** (recommended) or npm/yarn
- **Firebase Project** (Firestore, Auth, Storage enabled)
- **Google Account** for Firebase access

### Step-by-Step Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/IIPS_Placement_Portal.git
cd IIPS_Placement_Portal
```

#### 2. Install Dependencies

```bash
pnpm install
```

#### 3. Set Up Firebase

Follow the detailed instructions in [SETUP_GUIDE.md](SETUP_GUIDE.md) to:
- Create a Firebase project
- Enable Authentication (Google provider)
- Create Firestore database
- Enable Storage
- Generate service account credentials

#### 4. Configure Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Firebase credentials (see [Environment Variables](#-environment-variables)).

#### 5. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

#### 6. Create Admin User

After first login, run:

```bash
pnpm update-role -- --uid=YOUR_USER_ID --role=admin
```

---

## 🔐 Environment Variables

Create a `.env.local` file with the following variables:

```env
# Firebase Client (Public - safe for browser)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890

# Firebase Admin (Private - server only)
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Session Security
SESSION_SECRET_KEY=your_32_character_random_string
```

> ⚠️ **Never commit `.env.local` to version control!**

---

## 📜 Scripts & Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm type-check` | Run TypeScript type checking |
| `pnpm seed:students` | Seed test student data |
| `pnpm seed:drives` | Seed test placement drives |
| `pnpm seed:companies` | Seed test companies |
| `pnpm seed:applications` | Seed test applications |
| `pnpm seed:all` | Run all seed scripts |
| `pnpm update-role` | Update user role (admin/tpo) |
| `pnpm flush:db` | Clear all database collections |

### Script Examples

```bash
# Seed 50 test students
pnpm seed:students -- --generate=50

# Seed with dry run (preview only)
pnpm seed:students -- --generate=100 --dry-run

# Update user role to admin
pnpm update-role -- --uid=abc123 --role=admin

# Update user role to TPO
pnpm update-role -- --uid=xyz789 --role=tpo
```

---

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub

2. Connect to Vercel:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Configure environment variables
   - Deploy

3. Add environment variables in Vercel dashboard

### Build Commands

```bash
# Install dependencies
pnpm install

# Build command
pnpm build

# Output directory
.next
```

### Post-Deployment

1. Update Firebase Auth authorized domains
2. Test all authentication flows
3. Verify Firestore security rules
4. Set up database backups

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

### Code Style

- Use TypeScript for all new code
- Follow ESLint configuration
- Use Prettier for formatting
- Write meaningful commit messages

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your Name](https://linkedin.com/in/yourprofile)

---

## 🙏 Acknowledgments

- **IIPS, DAVV** - For the opportunity to build this platform
- **Next.js Team** - For the amazing framework
- **Firebase Team** - For the robust backend services
- **Radix UI** - For accessible component primitives
- **Tailwind CSS** - For the utility-first CSS framework

---

<p align="center">
  Made with ❤️ for IIPS Students
</p>

<p align="center">
  <a href="#-iips-smart-placement-portal">Back to Top ↑</a>
</p>
