#!/bin/bash

# Manual setup script for GitHub Codespaces
# Run this if the automatic setup didn't work

echo "🔧 Manual setup for GitHub Codespaces..."

# Create a .env file for Codespaces if it doesn't exist
if [ ! -f deployment/docker_compose/.env ]; then
    echo "📝 Creating .env file for Codespaces..."
    cat > deployment/docker_compose/.env << 'EOF'
# Codespaces Environment Configuration
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

# Development Settings (Full Features Enabled)
AUTH_TYPE=basic
DISABLE_MODEL_SERVER=False
LOG_LEVEL=info
DISABLE_TELEMETRY=false

# API Keys (to be configured by developer)
GEN_AI_API_KEY=
GEN_AI_MODEL_PROVIDER=openai
GEN_AI_MODEL_VERSION=gpt-4o
OPENAI_API_KEY=
OPENAI_API_KEY_FALLBACK=
COHERE_API_KEY=
COHERE_API_KEY_FALLBACK=

# OAuth Configuration
OAUTH_CLIENT_ID=
OAUTH_CLIENT_SECRET=
GOOGLE_OAUTH_CLIENT_ID=
GOOGLE_OAUTH_CLIENT_SECRET=
OPENID_CONFIG_URL=

# Session and Security
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
EOF
    echo "✅ .env file created"
else
    echo "✅ .env file already exists"
fi

# Create a startup script for easy development
echo "📝 Creating start-dev.sh..."
cat > start-dev.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting Onyx development environment..."

# Change to the docker compose directory
cd deployment/docker_compose

# Start the development services
echo "📦 Starting development services..."
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

echo "✅ Development environment started!"
echo "🌐 Web Interface: http://localhost:8088"
echo "🔌 API Server: http://localhost:8080"
echo "🗄️  PostgreSQL: localhost:5432"
echo "🔴 Redis: localhost:6379"
echo "🔍 Vespa Admin: http://localhost:19071"
echo "🔍 Vespa App: http://localhost:8081"
EOF

chmod +x start-dev.sh

# Create a stop script
echo "📝 Creating stop-dev.sh..."
cat > stop-dev.sh << 'EOF'
#!/bin/bash
echo "🛑 Stopping Onyx development environment..."

cd deployment/docker_compose
docker-compose -f docker-compose.yml -f docker-compose.dev.yml down

echo "✅ Development environment stopped!"
EOF

chmod +x stop-dev.sh

# Create a logs script
echo "📝 Creating logs-dev.sh..."
cat > logs-dev.sh << 'EOF'
#!/bin/bash
echo "📋 Showing Onyx development logs..."

cd deployment/docker_compose
docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs -f
EOF

chmod +x logs-dev.sh

# Create a script to switch to minimal features
echo "📝 Creating enable-minimal-features.sh..."
cat > enable-minimal-features.sh << 'EOF'
#!/bin/bash
echo "🔧 Switching to minimal features for faster development..."

ENV_FILE="deployment/docker_compose/.env"
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ .env file not found."
    exit 1
fi

# Backup current .env
cp "$ENV_FILE" "$ENV_FILE.backup.$(date +%Y%m%d_%H%M%S)"

# Update specific settings for minimal features
sed -i 's/AUTH_TYPE=basic/AUTH_TYPE=disabled/' "$ENV_FILE"
sed -i 's/DISABLE_MODEL_SERVER=False/DISABLE_MODEL_SERVER=True/' "$ENV_FILE"
sed -i 's/DISABLE_TELEMETRY=false/DISABLE_TELEMETRY=true/' "$ENV_FILE"

echo "✅ Minimal features enabled (auth disabled, model server disabled, telemetry disabled)"
echo "🚀 Restart with: ./stop-dev.sh && ./start-dev.sh"
EOF

chmod +x enable-minimal-features.sh

# Create a script to enable full features
echo "📝 Creating enable-full-features.sh..."
cat > enable-full-features.sh << 'EOF'
#!/bin/bash
echo "🔧 Enabling full features (matching dev server config)..."

ENV_FILE="deployment/docker_compose/.env"
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ .env file not found."
    exit 1
fi

# Backup current .env
cp "$ENV_FILE" "$ENV_FILE.backup.$(date +%Y%m%d_%H%M%S)"

# Update specific settings for full features
sed -i 's/AUTH_TYPE=disabled/AUTH_TYPE=basic/' "$ENV_FILE"
sed -i 's/DISABLE_MODEL_SERVER=True/DISABLE_MODEL_SERVER=False/' "$ENV_FILE"
sed -i 's/DISABLE_TELEMETRY=true/DISABLE_TELEMETRY=false/' "$ENV_FILE"

echo "✅ Full features enabled (auth enabled, model server enabled, telemetry enabled)"
echo "🚀 Restart with: ./stop-dev.sh && ./start-dev.sh"
EOF

chmod +x enable-full-features.sh

echo "✅ Manual setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Configure your API keys in deployment/docker_compose/.env:"
echo "   - OPENAI_API_KEY=your_openai_key"
echo "   - COHERE_API_KEY=your_cohere_key"
echo "   - OAUTH_CLIENT_ID=your_oauth_client_id (if using OAuth)"
echo "2. Run './start-dev.sh' to start the development environment"
echo "3. Access the application at http://localhost:8088"
echo ""
echo "🔧 Available commands:"
echo "  ./start-dev.sh              - Start development environment"
echo "  ./stop-dev.sh               - Stop development environment"
echo "  ./logs-dev.sh               - View logs"
echo "  ./enable-minimal-features.sh - Disable auth/AI for faster development"
echo "  ./enable-full-features.sh   - Enable all features (matches dev server)" 