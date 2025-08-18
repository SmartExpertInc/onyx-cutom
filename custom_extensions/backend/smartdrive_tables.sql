-- Smart Drive Database Tables

-- SmartDrive accounts table
CREATE TABLE IF NOT EXISTS smartdrive_accounts (
    user_id VARCHAR(255) PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_sync_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    config JSONB DEFAULT '{}'::jsonb
);

-- SmartDrive imports table
CREATE TABLE IF NOT EXISTS smartdrive_imports (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    status VARCHAR(50) DEFAULT 'processing',
    onyx_file_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES smartdrive_accounts(user_id) ON DELETE CASCADE
);

-- User connectors table
CREATE TABLE IF NOT EXISTS user_connectors (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    provider VARCHAR(100) NOT NULL,
    config JSONB DEFAULT '{}'::jsonb,
    encrypted_credentials TEXT,
    status VARCHAR(50) DEFAULT 'inactive',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES smartdrive_accounts(user_id) ON DELETE CASCADE
);

-- Connector sync jobs table
CREATE TABLE IF NOT EXISTS connector_sync_jobs (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    connector_id INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES smartdrive_accounts(user_id) ON DELETE CASCADE,
    FOREIGN KEY (connector_id) REFERENCES user_connectors(id) ON DELETE CASCADE
);

-- SmartDrive webhook logs table
CREATE TABLE IF NOT EXISTS smartdrive_webhook_logs (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(100),
    file_path VARCHAR(500),
    user_id VARCHAR(255),
    processed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payload JSONB
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_smartdrive_imports_user_id ON smartdrive_imports(user_id);
CREATE INDEX IF NOT EXISTS idx_smartdrive_imports_status ON smartdrive_imports(status);
CREATE INDEX IF NOT EXISTS idx_user_connectors_user_id ON user_connectors(user_id);
CREATE INDEX IF NOT EXISTS idx_user_connectors_status ON user_connectors(status);
CREATE INDEX IF NOT EXISTS idx_connector_sync_jobs_user_id ON connector_sync_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_connector_sync_jobs_status ON connector_sync_jobs(status);
CREATE INDEX IF NOT EXISTS idx_smartdrive_webhook_logs_processed ON smartdrive_webhook_logs(processed); 