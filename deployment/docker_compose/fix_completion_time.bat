@echo off
echo ========================================
echo Fixing completion_time column in database
echo ========================================

echo.
echo Step 1: Checking current schema...
docker compose exec custom_backend psql $CUSTOM_PROJECTS_DATABASE_URL -c "SELECT table_name, column_name, data_type FROM information_schema.columns WHERE table_name IN ('projects', 'trashed_projects') AND column_name = 'completion_time';"

echo.
echo Step 2: Applying migration to projects table...
docker compose exec custom_backend psql $CUSTOM_PROJECTS_DATABASE_URL -c "ALTER TABLE projects ALTER COLUMN completion_time TYPE INTEGER USING CASE WHEN completion_time IS NULL THEN 0 WHEN completion_time = '' THEN 0 WHEN completion_time ~ '^[0-9]+$' THEN CAST(completion_time AS INTEGER) ELSE 0 END;"

echo.
echo Step 3: Applying migration to trashed_projects table...
docker compose exec custom_backend psql $CUSTOM_PROJECTS_DATABASE_URL -c "ALTER TABLE trashed_projects ALTER COLUMN completion_time TYPE INTEGER USING CASE WHEN completion_time IS NULL THEN 0 WHEN completion_time = '' THEN 0 WHEN completion_time ~ '^[0-9]+$' THEN CAST(completion_time AS INTEGER) ELSE 0 END;"

echo.
echo Step 4: Verifying migration...
docker compose exec custom_backend psql $CUSTOM_PROJECTS_DATABASE_URL -c "SELECT table_name, column_name, data_type FROM information_schema.columns WHERE table_name IN ('projects', 'trashed_projects') AND column_name = 'completion_time';"

echo.
echo Step 5: Testing CASE statement logic...
docker compose exec custom_backend psql $CUSTOM_PROJECTS_DATABASE_URL -c "SELECT CASE WHEN '' IS NULL THEN 0 WHEN '' = '' THEN 0 WHEN '' ~ '^[0-9]+$' THEN CAST('' AS INTEGER) ELSE 0 END as empty_string_test;"

echo.
echo ========================================
echo Migration completed!
echo ========================================
echo.
echo Next steps:
echo 1. The completion_time columns are now INTEGER type
echo 2. Trash operations should work correctly
echo 3. Test moving a course outline to trash
echo.
pause 