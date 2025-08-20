-- Create video_generation_tasks table for tracking Elai video generation
CREATE TABLE IF NOT EXISTS video_generation_tasks (
    id SERIAL PRIMARY KEY,
    project_id VARCHAR(255) NOT NULL,
    slide_id VARCHAR(255) NOT NULL,
    video_id VARCHAR(255) NOT NULL,
    avatar_code VARCHAR(100) NOT NULL DEFAULT 'gia.1',
    voice VARCHAR(100) NOT NULL DEFAULT 'en-US-JennyNeural',
    background_color VARCHAR(20) NOT NULL DEFAULT '#00FF00',
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE,
    onyx_user_id VARCHAR(255) NOT NULL,
    download_url TEXT,
    error_message TEXT,
    
    -- Indexes for performance
    INDEX idx_video_tasks_project_id (project_id),
    INDEX idx_video_tasks_user_id (onyx_user_id),
    INDEX idx_video_tasks_status (status),
    INDEX idx_video_tasks_video_id (video_id),
    INDEX idx_video_tasks_created_at (created_at)
);

-- Add comments for documentation
COMMENT ON TABLE video_generation_tasks IS 'Tracks Elai video generation tasks for video lessons';
COMMENT ON COLUMN video_generation_tasks.project_id IS 'Reference to the project/project ID';
COMMENT ON COLUMN video_generation_tasks.slide_id IS 'Reference to the specific slide being processed';
COMMENT ON COLUMN video_generation_tasks.video_id IS 'Elai video ID returned from API';
COMMENT ON COLUMN video_generation_tasks.avatar_code IS 'Avatar code used for video generation';
COMMENT ON COLUMN video_generation_tasks.voice IS 'Voice code used for narration';
COMMENT ON COLUMN video_generation_tasks.background_color IS 'Background color used (typically green screen)';
COMMENT ON COLUMN video_generation_tasks.status IS 'Current status: pending, rendering, done, failed';
COMMENT ON COLUMN video_generation_tasks.download_url IS 'URL to download completed video from Elai';
COMMENT ON COLUMN video_generation_tasks.error_message IS 'Error message if generation failed';
