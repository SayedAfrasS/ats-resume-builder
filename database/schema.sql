-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255),
    phone VARCHAR(30),
    location VARCHAR(150),
    linkedin VARCHAR(255),
    github VARCHAR(255),
    plan VARCHAR(20) DEFAULT 'Free',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Resumes table (stores full resume data + AI results)
CREATE TABLE resumes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    job_role VARCHAR(100),
    raw_input JSONB,
    ai_generated JSONB,
    ats_score INTEGER DEFAULT 0,
    ats_breakdown JSONB,
    improvements JSONB,
    company_matches JSONB,
    template_id VARCHAR(50) DEFAULT 'the-zurich',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Company roles (for job matching intelligence)
CREATE TABLE company_roles (
    id SERIAL PRIMARY KEY,
    company_name VARCHAR(150),
    role VARCHAR(100),
    job_description TEXT,
    extracted_skills TEXT[],
    apply_link VARCHAR(500),
    location VARCHAR(150),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast user resume lookups
CREATE INDEX idx_resumes_user_id ON resumes(user_id);
CREATE INDEX idx_resumes_job_role ON resumes(job_role);
CREATE INDEX idx_company_roles_role ON company_roles(role);

-- User analyses table (stores ATS analysis results per user)
CREATE TABLE user_analyses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    job_role VARCHAR(100),
    file_name VARCHAR(255),
    ats_score INTEGER DEFAULT 0,
    grade VARCHAR(5),
    breakdown JSONB,
    benefits JSONB,
    issues JSONB,
    keywords JSONB,
    skills JSONB,
    company_matches JSONB,
    ai_suggestions JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_analyses_user_id ON user_analyses(user_id);
CREATE INDEX idx_user_analyses_created_at ON user_analyses(created_at DESC);
