-- Migration: Create machine_sessions table for IDE containers
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS machine_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  fly_machine_id TEXT NOT NULL,
  fly_region TEXT NOT NULL DEFAULT 'gru',
  status TEXT NOT NULL DEFAULT 'running',
  private_ip TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_heartbeat TIMESTAMPTZ NOT NULL DEFAULT now(),
  github_repo TEXT
);

-- Index para busca por user + status
CREATE INDEX IF NOT EXISTS idx_machine_sessions_user_status
  ON machine_sessions(user_id, status);

-- Constraint: apenas 1 machine "running" por user
CREATE UNIQUE INDEX IF NOT EXISTS idx_machine_sessions_active_user
  ON machine_sessions(user_id)
  WHERE status = 'running';

-- RLS
ALTER TABLE machine_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: users can see their own machines
CREATE POLICY "Users can view own machines"
  ON machine_sessions FOR SELECT
  USING (user_id = auth.uid());

-- Service role (API routes) bypass RLS automatically
