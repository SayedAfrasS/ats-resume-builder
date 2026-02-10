# SpellFolio-ATS Resume Builder

A full-stack application that helps job seekers create ATS-optimized resumes and analyze their compatibility with job descriptions using AI-powered insights.

## 🚀 Features

- **Resume Builder**: Create professional resumes tailored for Applicant Tracking Systems (ATS)
- **ATS Score Analysis**: Get detailed scoring and feedback on your resume's ATS compatibility
- **AI-Powered Improvements**: Receive intelligent suggestions to enhance your resume
- **Job Matching**: Find company roles that match your skills and experience
- **Multiple Templates**: Choose from various professional resume templates
- **PDF Support**: Upload and analyze existing resumes
- **Skill Extraction**: Automatically extract and highlight relevant skills

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** - React framework
- **React 19** - UI library
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **React PDF** - PDF generation
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **PostgreSQL** - Database
- **Groq SDK** - AI integration
- **Multer** - File uploads
- **bcryptjs** - Password hashing
- **pdf-parse** - PDF text extraction

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **PostgreSQL** (v12 or higher)
- **Git**

## 🔧 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/SayedAfrasS/ats-resume-builder.git
cd ats-resume-builder
```

### 2. Install Dependencies

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd frontend
npm install
```

### 3. Database Setup

Create a PostgreSQL database:

```sql
CREATE DATABASE ats_resume_builder;
```

Run the schema file to create tables:

```bash
psql -U postgres -d ats_resume_builder -f database/schema.sql
```

Or manually execute the SQL in [database/schema.sql](database/schema.sql)

### 4. Environment Configuration

Create a `.env` file in the `backend` directory:

```bash
cd backend
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=your_password_here
DB_NAME=ats_resume_builder
DB_PORT=5432

# Server Configuration
PORT=5000

# Groq AI API Key (get from https://console.groq.com)
GROQ_API_KEY=your_groq_api_key_here

# RapidAPI (for LinkedIn job data - optional)
RAPIDAPI_KEY=your_rapidapi_key_here
RAPIDAPI_HOST=linkedin-data-api.p.rapidapi.com
```

### 5. Get API Keys

- **Groq API Key**: Sign up at [Groq Console](https://console.groq.com) for AI features
- **RapidAPI Key** (Optional): Get from [RapidAPI](https://rapidapi.com) for job data

## 🚀 Running the Application

### Development Mode

#### Start Backend Server
```bash
cd backend
npm run dev
```
Backend will run on `http://localhost:5000`

#### Start Frontend Server
```bash
cd frontend
npm run dev
```
Frontend will run on `http://localhost:3000`

### Production Mode

#### Build Frontend
```bash
cd frontend
npm run build
npm start
```

#### Start Backend
```bash
cd backend
npm start
```

## 📁 Project Structure

```
ats-resume-builder/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── controllers/     # Request handlers
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   └── scripts/         # Utility scripts
│   ├── server.js            # Entry point
│   └── package.json
│
├── frontend/
│   ├── app/
│   │   ├── auth/            # Authentication pages
│   │   ├── builder/         # Resume builder
│   │   ├── analyzer/        # ATS analyzer
│   │   ├── dashboard/       # User dashboard
│   │   ├── jobs/            # Job listings
│   │   └── templates/       # Resume templates
│   ├── components/          # Reusable components
│   ├── lib/                 # Utilities and helpers
│   └── package.json
│
└── database/
    └── schema.sql           # Database schema
```

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login

### Resume
- `POST /api/resume/create` - Create new resume
- `GET /api/resume/:userId` - Get user resumes
- `POST /api/resume/analyze` - Analyze resume ATS score
- `POST /api/resume/improve` - Get improvement suggestions

## 🎨 Features Overview

### Dashboard
- View all your resumes
- Track ATS scores
- Access recent analyses

### Resume Builder
- Step-by-step resume creation
- Real-time preview
- Multiple template options
- Export to PDF

### ATS Analyzer
- Upload existing resume
- Get detailed ATS score
- Receive improvement suggestions
- Keyword matching analysis

### Job Matching
- Find relevant job openings
- Match skills with requirements
- Company recommendations

---

**Note**: Make sure to never commit your `.env` file with actual API keys to version control. The `.env.example` file is provided as a template.
