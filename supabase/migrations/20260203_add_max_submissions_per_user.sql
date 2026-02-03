-- Add max_submissions_per_user column to campaigns table
-- This allows admins to configure how many submissions each user can make per campaign

ALTER TABLE campaigns 
ADD COLUMN max_submissions_per_user INTEGER NOT NULL DEFAULT 1;

-- Add a comment to document the column
COMMENT ON COLUMN campaigns.max_submissions_per_user IS 'Maximum number of submissions allowed per user for this campaign';
