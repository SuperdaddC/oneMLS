-- Saved/Favorited Listings
CREATE TABLE IF NOT EXISTS saved_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, property_id)
);

CREATE INDEX idx_saved_listings_user ON saved_listings(user_id);
CREATE INDEX idx_saved_listings_property ON saved_listings(property_id);

ALTER TABLE saved_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their saved listings" ON saved_listings
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can save listings" ON saved_listings
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unsave listings" ON saved_listings
  FOR DELETE USING (auth.uid() = user_id);
