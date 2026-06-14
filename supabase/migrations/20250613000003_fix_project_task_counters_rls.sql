-- Fix: "new row violates row-level security policy for table project_task_counters"
-- Happens when creating a task and the counter trigger cannot write to project_task_counters.

-- ---------------------------------------------------------------------------
-- 1) Diagnostic (optional): see which trigger runs on tasks
-- ---------------------------------------------------------------------------
SELECT
  c.relname AS table_name,
  t.tgname AS trigger_name,
  p.proname AS function_name,
  p.prosecdef AS security_definer
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
JOIN pg_proc p ON p.oid = t.tgfoid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relname IN ('tasks', 'epics')
  AND NOT t.tgisinternal;

-- ---------------------------------------------------------------------------
-- 2) Allow project members to read/write task counters
-- ---------------------------------------------------------------------------
GRANT SELECT, INSERT, UPDATE ON TABLE public.project_task_counters TO authenticated;

ALTER TABLE public.project_task_counters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "project_members_manage_task_counters" ON public.project_task_counters;
CREATE POLICY "project_members_manage_task_counters"
ON public.project_task_counters
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.project_members pm
    WHERE pm.project_id = project_task_counters.project_id
      AND pm.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.project_members pm
    WHERE pm.project_id = project_task_counters.project_id
      AND pm.user_id = auth.uid()
  )
);

-- ---------------------------------------------------------------------------
-- 3) Same fix for epic counters (prevents the same error on epic creation)
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF to_regclass('public.project_epic_counters') IS NOT NULL THEN
    EXECUTE 'GRANT SELECT, INSERT, UPDATE ON TABLE public.project_epic_counters TO authenticated';
    EXECUTE 'ALTER TABLE public.project_epic_counters ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "project_members_manage_epic_counters" ON public.project_epic_counters';
    EXECUTE $policy$
      CREATE POLICY "project_members_manage_epic_counters"
      ON public.project_epic_counters
      FOR ALL
      TO authenticated
      USING (
        EXISTS (
          SELECT 1
          FROM public.project_members pm
          WHERE pm.project_id = project_epic_counters.project_id
            AND pm.user_id = auth.uid()
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1
          FROM public.project_members pm
          WHERE pm.project_id = project_epic_counters.project_id
            AND pm.user_id = auth.uid()
        )
      )
    $policy$;
  END IF;
END
$$;

-- ---------------------------------------------------------------------------
-- 4) Ensure ID generator trigger functions run with elevated privileges
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  fn record;
BEGIN
  FOR fn IN
    SELECT
      n.nspname AS schema_name,
      p.proname AS function_name,
      pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname IN (
        'generate_project_task_id',
        'generate_project_epic_id',
        'set_project_task_id',
        'set_task_id'
      )
  LOOP
    EXECUTE format(
      'ALTER FUNCTION %I.%I(%s) SECURITY DEFINER',
      fn.schema_name,
      fn.function_name,
      fn.args
    );
  END LOOP;
END
$$;
