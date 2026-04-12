CREATE TABLE IF NOT EXISTS collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  client_name text,
  client_email text,
  share_token text UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS collection_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id uuid NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  agent_notes text,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(collection_id, property_id)
);

CREATE INDEX idx_collections_agent ON collections(agent_id);
CREATE INDEX idx_collections_token ON collections(share_token);
CREATE INDEX idx_collection_items_collection ON collection_items(collection_id);

ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agents can manage their collections" ON collections FOR ALL USING (auth.uid() = agent_id) WITH CHECK (auth.uid() = agent_id);
CREATE POLICY "Agents can manage their collection items" ON collection_items FOR ALL USING (collection_id IN (SELECT id FROM collections WHERE agent_id = auth.uid())) WITH CHECK (collection_id IN (SELECT id FROM collections WHERE agent_id = auth.uid()));
-- Public access via share token handled in the app
CREATE POLICY "Anyone can view shared collections" ON collections FOR SELECT USING (share_token IS NOT NULL);
CREATE POLICY "Anyone can view shared collection items" ON collection_items FOR SELECT USING (collection_id IN (SELECT id FROM collections WHERE share_token IS NOT NULL));
