CREATE TABLE IF NOT EXISTS property_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  viewer_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  source text NOT NULL DEFAULT 'direct',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_property_views_property ON property_views(property_id);
CREATE INDEX idx_property_views_created ON property_views(created_at);
CREATE INDEX idx_property_views_source ON property_views(source);

ALTER TABLE property_views ENABLE ROW LEVEL SECURITY;

-- Anyone can insert views (including anonymous)
CREATE POLICY "Anyone can record views" ON property_views FOR INSERT WITH CHECK (true);
-- Property owners can see views on their listings
CREATE POLICY "Owners can view analytics" ON property_views FOR SELECT
  USING (property_id IN (SELECT id FROM properties WHERE owner_id = auth.uid()));

-- Also track saves count and showing requests per property
CREATE TABLE IF NOT EXISTS property_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN ('share', 'save', 'contact', 'showing_request', 'flyer_download', 'social_card_download', 'qr_download')),
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_property_events_property ON property_events(property_id);
CREATE INDEX idx_property_events_type ON property_events(event_type);
CREATE INDEX idx_property_events_created ON property_events(created_at);

ALTER TABLE property_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can record events" ON property_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Owners can view events" ON property_events FOR SELECT
  USING (property_id IN (SELECT id FROM properties WHERE owner_id = auth.uid()));
