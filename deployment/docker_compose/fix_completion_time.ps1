Write-Host "========================================" -ForegroundColor Green
Write-Host "Fixing completion_time column in database" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

Write-Host ""
Write-Host "Step 1: Checking current schema..." -ForegroundColor Yellow
docker compose exec custom_backend psql $env:CUSTOM_PROJECTS_DATABASE_URL -c "SELECT table_name, column_name, data_type FROM information_schema.columns WHERE table_name IN ('projects', 'trashed_projects') AND column_name = 'completion_time';"

Write-Host ""
Write-Host "Step 2: Applying migration to projects table..." -ForegroundColor Yellow
docker compose exec custom_backend psql $env:CUSTOM_PROJECTS_DATABASE_URL -c "ALTER TABLE projects ALTER COLUMN completion_time TYPE INTEGER USING CASE WHEN completion_time IS NULL THEN 0 WHEN completion_time = '' THEN 0 WHEN completion_time ~ '^[0-9]+$' THEN CAST(completion_time AS INTEGER) ELSE 0 END;"

Write-Host ""
Write-Host "Step 3: Applying migration to trashed_projects table..." -ForegroundColor Yellow
docker compose exec custom_backend psql $env:CUSTOM_PROJECTS_DATABASE_URL -c "ALTER TABLE trashed_projects ALTER COLUMN completion_time TYPE INTEGER USING CASE WHEN completion_time IS NULL THEN 0 WHEN completion_time = '' THEN 0 WHEN completion_time ~ '^[0-9]+$' THEN CAST(completion_time AS INTEGER) ELSE 0 END;"

Write-Host ""
Write-Host "Step 4: Verifying migration..." -ForegroundColor Yellow
docker compose exec custom_backend psql $env:CUSTOM_PROJECTS_DATABASE_URL -c "SELECT table_name, column_name, data_type FROM information_schema.columns WHERE table_name IN ('projects', 'trashed_projects') AND column_name = 'completion_time';"

Write-Host ""
Write-Host "Step 5: Testing CASE statement logic..." -ForegroundColor Yellow
docker compose exec custom_backend psql $env:CUSTOM_PROJECTS_DATABASE_URL -c "SELECT CASE WHEN '' IS NULL THEN 0 WHEN '' = '' THEN 0 WHEN '' ~ '^[0-9]+$' THEN CAST('' AS INTEGER) ELSE 0 END as empty_string_test;"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Migration completed!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. The completion_time columns are now INTEGER type" -ForegroundColor White
Write-Host "2. Trash operations should work correctly" -ForegroundColor White
Write-Host "3. Test moving a course outline to trash" -ForegroundColor White
Write-Host ""
Read-Host "Press Enter to continue" 