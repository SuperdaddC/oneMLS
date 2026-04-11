CREATE TABLE IF NOT EXISTS open_houses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  agent_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  notes text,
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'cancelled', 'completed')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_open_houses_property ON open_houses(property_id);
CREATE INDEX idx_open_houses_agent ON open_houses(agent_id);
CREATE INDEX idx_open_houses_date ON open_houses(event_date);

ALTER TABLE open_houses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view scheduled open houses"
  ON open_houses FOR SELECT
  USING (status = 'scheduled');

CREATE POLICY "Agents can view their own open houses"
  ON open_houses FOR SELECT
  USING (auth.uid() = agent_id);

CREATE POLICY "Agents can insert open houses"
  ON open_houses FOR INSERT
  WITH CHECK (auth.uid() = agent_id);

CREATE POLICY "Agents can update their open houses"
  ON open_houses FOR UPDATE
  USING (auth.uid() = agent_id)
  WITH CHECK (auth.uid() = agent_id);

CREATE POLICY "Agents can delete their open houses"
  ON open_houses FOR DELETE
  USING (auth.uid() = agent_id);
