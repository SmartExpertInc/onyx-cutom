@echo off
echo Applying completion_time migration to database...

REM Check current schema
echo Checking current schema...
docker compose exec relational_db psql -U postgres -d onyx_db -c "SELECT table_name, column_name, data_type FROM information_schema.columns WHERE table_name IN ('projects', 'trashed_projects') AND column_name = 'completion_time';"

echo.
echo Applying migration...

REM Fix projects table
docker compose exec relational_db psql -U postgres -d onyx_db -c "ALTER TABLE projects ALTER COLUMN completion_time TYPE INTEGER USING CASE WHEN completion_time IS NULL THEN 0 WHEN completion_time = '' THEN 0 WHEN completion_time ~ '^[0-9]+$' THEN CAST(completion_time AS INTEGER) ELSE 0 END;"

REM Fix trashed_projects table
docker compose exec relational_db psql -U postgres -d onyx_db -c "ALTER TABLE trashed_projects ALTER COLUMN completion_time TYPE INTEGER USING CASE WHEN completion_time IS NULL THEN 0 WHEN completion_time = '' THEN 0 WHEN completion_time ~ '^[0-9]+$' THEN CAST(completion_time AS INTEGER) ELSE 0 END;"

echo.
echo Verifying migration...
docker compose exec relational_db psql -U postgres -d onyx_db -c "SELECT table_name, column_name, data_type FROM information_schema.columns WHERE table_name IN ('projects', 'trashed_projects') AND column_name = 'completion_time';"

echo.
echo Migration completed!
pause 