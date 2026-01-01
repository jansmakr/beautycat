-- Migration: Add quote_id to reviews table
-- Created: 2025-12-31
-- Purpose: Link reviews to specific quotes for better tracking

-- Add quote_id column to reviews table
ALTER TABLE reviews ADD COLUMN quote_id TEXT;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_reviews_quote ON reviews(quote_id);

-- Add foreign key constraint (SQLite doesn't support adding FK after table creation,
-- so this is documented but not enforced at DB level)
-- FOREIGN KEY (quote_id) REFERENCES quotes(id)

-- Note: Existing reviews will have NULL quote_id
-- New reviews should include quote_id for proper tracking
