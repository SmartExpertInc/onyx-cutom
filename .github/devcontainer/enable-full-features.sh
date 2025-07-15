#!/bin/bash

# Script to enable full Onyx features in Codespaces
# This matches the current dev server configuration

echo "🔧 Enabling full Onyx features (matching dev server config)..."

# Check if .env file exists
ENV_FILE="/workspaces/onyx-cutom/deployment/docker_compose/.env"
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ .env file not found. Please run the initial setup first."
    exit 1
fi

# Backup current .env
cp "$ENV_FILE" "$ENV_FILE.backup.$(date +%Y%m%d_%H%M%S)"
echo "📋 Backed up current .env file"

# Update .env with full features enabled (matching dev server)
echo "🔄 Updating .env file to match dev server configuration..."

# Create a temporary file with the new configuration
cat > /tmp/onyx_full_features.env << 'EOF'
# Codespaces Environment Configuration (Full Features - Dev Server Match)
WEB_DOMAIN=http://localhost:8088
WEB_DOMAIN_NO_PROTOCOL=localhost:8088

# Database Configuration
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=onyx_db
POSTGRES_HOST=relational_db

# Redis Configuration
REDIS_HOST=cache

# Vespa Configuration
VESPA_HOST=index

# Custom Projects Database
CUSTOM_PROJECTS_DB_USER=custom_user
CUSTOM_PROJECTS_DB_PASSWORD=custom_password
CUSTOM_PROJECTS_DB_NAME=custom_projects_db

# Full Features Enabled (matching dev server)
AUTH_TYPE=basic
DISABLE_MODEL_SERVER=False
LOG_LEVEL=info
DISABLE_TELEMETRY=false

# API Keys (REQUIRED - match your dev server keys)
GEN_AI_API_KEY=
GEN_AI_MODEL_PROVIDER=openai
GEN_AI_MODEL_VERSION=gpt-4o
OPENAI_API_KEY=
OPENAI_API_KEY_FALLBACK=
COHERE_API_KEY=
COHERE_API_KEY_FALLBACK=

# OAuth Configuration (match your dev server)
OAUTH_CLIENT_ID=
OAUTH_CLIENT_SECRET=
GOOGLE_OAUTH_CLIENT_ID=
GOOGLE_OAUTH_CLIENT_SECRET=
OPENID_CONFIG_URL=

# Session and Security (matching dev server)
SESSION_EXPIRE_TIME_SECONDS=604800
ENCRYPTION_KEY_SECRET=cf4b4334-1642-11f0-bbd8-b7a784c6393f

# AI Model Configuration
GEN_AI_MAX_TOKENS=4000
QA_TIMEOUT=60
MAX_CHUNKS_FED_TO_CHAT=10
DISABLE_LLM_CHOOSE_SEARCH=false
DISABLE_LLM_QUERY_REPHRASE=false
DISABLE_GENERATIVE_AI=false
DISABLE_LITELLM_STREAMING=false

# Search Configuration
DOC_TIME_DECAY=0.1
HYBRID_ALPHA=0.5
EDIT_KEYWORD_QUERY=false
MULTILINGUAL_QUERY_EXPANSION=false
LANGUAGE_HINT=en
LANGUAGE_CHAT_NAMING_HINT=en

# Model Server Configuration
MIN_THREADS_ML_MODELS=1
VESPA_SEARCHER_THREADS=1

# Node.js Configuration
NODE_OPTIONS=--max-old-space-size=6144

# Additional dev server settings
COMPOSE_PROJECT_NAME=onyx-stack
INTERNAL_URL=http://api_server:8080
EOF

# Replace the .env file
cp /tmp/onyx_full_features.env "$ENV_FILE"
rm /tmp/onyx_full_features.env

echo "✅ Full features enabled (matching dev server configuration)!"
echo ""
echo "⚠️  IMPORTANT: You need to configure API keys for AI features to work:"
echo "   1. Edit deployment/docker_compose/.env"
echo "   2. Add your API keys (copy from your dev server .env):"
echo "      - OPENAI_API_KEY=your_openai_key"
echo "      - OPENAI_API_KEY_FALLBACK=your_fallback_key"
echo "      - COHERE_API_KEY=your_cohere_key"
echo "      - COHERE_API_KEY_FALLBACK=your_cohere_fallback"
echo "      - OAUTH_CLIENT_ID=your_oauth_client_id"
echo "      - OAUTH_CLIENT_SECRET=your_oauth_client_secret"
echo ""
echo "🔐 Authentication is enabled with AUTH_TYPE=basic"
echo "🤖 AI features are enabled (model server, generative AI, etc.)"
echo "📊 Telemetry is enabled"
echo ""
echo "🚀 To apply changes:"
echo "   ./stop-dev.sh"
echo "   ./start-dev.sh"
echo ""
echo "💡 To switch to minimal features for faster development:"
echo "   ./enable-minimal-features.sh" 