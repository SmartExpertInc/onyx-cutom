-- Smart Drive Database Tables Migration
-- This script creates the necessary tables for Smart Drive functionality

-- SmartDrive Accounts: Per-user SmartDrive linkage and cursors
CREATE TABLE IF NOT EXISTS smartdrive_accounts (
    id SERIAL PRIMARY KEY,
    onyx_user_id VARCHAR(255) NOT NULL UNIQUE,
    nextcloud_user_id VARCHAR(255) NOT NULL,
    sync_cursor JSONB DEFAULT '{}',
    credentials_encrypted TEXT, -- Encrypted Nextcloud credentials if needed
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT idx_smartdrive_accounts_onyx_user UNIQUE (onyx_user_id)
);

-- SmartDrive Imports: Maps SmartDrive files to Onyx files with etags/checksums
CREATE TABLE IF NOT EXISTS smartdrive_imports (
    id SERIAL PRIMARY KEY,
    onyx_user_id VARCHAR(255) NOT NULL,
    smartdrive_path VARCHAR(1000) NOT NULL,
    onyx_file_id VARCHAR(255) NOT NULL,
    etag VARCHAR(255),
    checksum VARCHAR(255),
    file_size BIGINT,
    mime_type VARCHAR(255),
    imported_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_modified TIMESTAMP WITH TIME ZONE,
    CONSTRAINT idx_smartdrive_imports_user_path UNIQUE (onyx_user_id, smartdrive_path),
    INDEX idx_smartdrive_imports_onyx_user_id (onyx_user_id),
    INDEX idx_smartdrive_imports_onyx_file_id (onyx_file_id)
);

-- User Connectors: Per-user connector configs and encrypted tokens
CREATE TABLE IF NOT EXISTS user_connectors (
    id SERIAL PRIMARY KEY,
    onyx_user_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    source VARCHAR(100) NOT NULL, -- 'google_drive', 'dropbox', 'slack', etc.
    config JSONB DEFAULT '{}', -- Connector-specific configuration
    credentials_encrypted TEXT, -- Encrypted credentials/tokens
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'paused', 'error', 'syncing'
    last_sync_at TIMESTAMP WITH TIME ZONE,
    last_error TEXT,
    total_docs_indexed INTEGER DEFAULT 0,
    onyx_connector_id INTEGER, -- Reference to actual Onyx connector
    onyx_credential_id INTEGER, -- Reference to actual Onyx credential
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_connectors_onyx_user_id (onyx_user_id),
    INDEX idx_user_connectors_source (source),
    INDEX idx_user_connectors_status (status)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_smartdrive_accounts_nextcloud_user ON smartdrive_accounts(nextcloud_user_id);
CREATE INDEX IF NOT EXISTS idx_smartdrive_imports_imported_at ON smartdrive_imports(imported_at);
CREATE INDEX IF NOT EXISTS idx_user_connectors_created_at ON user_connectors(created_at);

-- Comments for documentation
COMMENT ON TABLE smartdrive_accounts IS 'Per-user SmartDrive account linkage and sync state tracking';
COMMENT ON COLUMN smartdrive_accounts.sync_cursor IS 'JSON cursor for tracking sync state with Nextcloud';
COMMENT ON COLUMN smartdrive_accounts.credentials_encrypted IS 'Encrypted Nextcloud credentials if using user-specific auth';

COMMENT ON TABLE smartdrive_imports IS 'Mapping between SmartDrive files and imported Onyx documents';
COMMENT ON COLUMN smartdrive_imports.etag IS 'Nextcloud ETag for change detection';
COMMENT ON COLUMN smartdrive_imports.checksum IS 'File checksum for integrity verification';

COMMENT ON TABLE user_connectors IS 'Per-user connector configurations for private data source access';
COMMENT ON COLUMN user_connectors.config IS 'Connector-specific configuration parameters';
COMMENT ON COLUMN user_connectors.credentials_encrypted IS 'Encrypted OAuth tokens or credentials';
COMMENT ON COLUMN user_connectors.onyx_connector_id IS 'Reference to the actual Onyx connector instance';
COMMENT ON COLUMN user_connectors.onyx_credential_id IS 'Reference to the actual Onyx credential instance'; 