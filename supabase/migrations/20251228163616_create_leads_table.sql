-- Create leads table for storing captured leads
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    conversation_summary TEXT NOT NULL,
    inquiry_type TEXT NOT NULL CHECK (inquiry_type IN ('freelance_project', 'app_question', 'partnership', 'other')),
    is_duplicate BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Enable Row Level Security
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Create policy for service role (agent backend)
CREATE POLICY "Service role can do everything" ON leads
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Index for duplicate checking (email + recent created_at)
CREATE INDEX idx_leads_email_created ON leads (email, created_at DESC);
