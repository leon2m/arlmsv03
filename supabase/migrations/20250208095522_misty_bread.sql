-- System and Theme Settings
CREATE TABLE system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE theme_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  settings JSONB NOT NULL,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Insights table
CREATE TABLE ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  type TEXT CHECK (type IN ('learning_path', 'performance', 'recommendation')),
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE theme_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage system settings"
  ON system_settings FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Everyone can view system settings"
  ON system_settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage theme settings"
  ON theme_settings FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Everyone can view theme settings"
  ON theme_settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can view their AI insights"
  ON ai_insights FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Insert default theme
INSERT INTO theme_settings (name, settings, is_active) VALUES
(
  'Default Theme',
  '{
    "colors": {
      "primary": {
        "50": "#eff6ff",
        "100": "#dbeafe",
        "500": "#3b82f6",
        "600": "#2563eb",
        "700": "#1d4ed8"
      },
      "background": "#ffffff",
      "text": "#111827"
    },
    "fonts": {
      "primary": "Inter",
      "secondary": "system-ui"
    },
    "borderRadius": "0.5rem",
    "spacing": {
      "small": "0.5rem",
      "medium": "1rem",
      "large": "1.5rem"
    }
  }'::jsonb,
  true
);

-- Insert initial system settings
INSERT INTO system_settings (key, value, category) VALUES
(
  'general',
  '{
    "siteName": "AR Learning",
    "description": "Modern Learning Management System",
    "language": "tr",
    "timezone": "Europe/Istanbul",
    "features": {
      "aiAssistant": true,
      "gamification": true,
      "socialLearning": true
    }
  }'::jsonb,
  'core'
),
(
  'notifications',
  '{
    "email": {
      "enabled": true,
      "courseReminders": true,
      "assessmentReminders": true
    },
    "inApp": {
      "enabled": true,
      "sound": true
    }
  }'::jsonb,
  'communication'
),
(
  'security',
  '{
    "sessionTimeout": 3600,
    "maxLoginAttempts": 5,
    "passwordPolicy": {
      "minLength": 8,
      "requireNumbers": true,
      "requireSymbols": true
    }
  }'::jsonb,
  'security'
);