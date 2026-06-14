-- Diagnostic: find which table the project_epics view references
-- Run this first if epics fail to load.

SELECT definition
FROM pg_views
WHERE schemaname = 'public'
  AND viewname = 'project_epics';

-- List user-related tables in public schema
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('users', 'profiles', 'user_profiles');

-- Note: this project reads epics from the `epics` table directly in app code.
-- No change needed here unless you want to fix the legacy `project_epics` view.
