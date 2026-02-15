-- Add factory_logs table for monitoring cron job execution
CREATE TABLE IF NOT EXISTS factory_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  block_id UUID REFERENCES blocks(id) ON DELETE SET NULL,
  category TEXT NOT NULL,
  vibe TEXT NOT NULL,
  prompt TEXT NOT NULL,
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT,
  generation_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_factory_logs_created_at ON factory_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_factory_logs_category ON factory_logs(category);
CREATE INDEX IF NOT EXISTS idx_factory_logs_success ON factory_logs(success);

-- Grant permissions
GRANT ALL ON factory_logs TO authenticated;
GRANT SELECT ON factory_logs TO anon;

-- Create view for factory statistics
CREATE OR REPLACE VIEW factory_stats AS
SELECT 
  category,
  COUNT(*) as total_generated,
  SUM(CASE WHEN success THEN 1 ELSE 0 END) as successful,
  SUM(CASE WHEN success THEN 0 ELSE 1 END) as failed,
  ROUND(AVG(generation_time_ms)) as avg_time_ms,
  MAX(created_at) as last_generated
FROM factory_logs
GROUP BY category
ORDER BY total_generated DESC;

-- Grant view access
GRANT SELECT ON factory_stats TO authenticated;
GRANT SELECT ON factory_stats TO anon;

COMMENT ON TABLE factory_logs IS 'Logs all automated block generation from Factory cron job';
COMMENT ON VIEW factory_stats IS 'Aggregated statistics for Factory block generation';
