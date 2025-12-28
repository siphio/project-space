-- Add reference_id column to leads table
ALTER TABLE leads ADD COLUMN reference_id TEXT;

-- Create index for quick reference lookups
CREATE INDEX idx_leads_reference_id ON leads (reference_id);
