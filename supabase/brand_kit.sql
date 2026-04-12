CREATE TABLE IF NOT EXISTS brand_kits (
  user_id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  primary_color text DEFAULT '#c9a962',
  secondary_color text DEFAULT '#0f172a',
  logo_url text,
  tagline text,
  website_url text,
  social_instagram text,
  social_facebook text,
  social_linkedin text,
  social_twitter text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE brand_kits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their brand kit" ON brand_kits FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
