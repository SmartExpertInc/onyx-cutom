#!/bin/bash

# Setup script for GitHub Codespaces
set -e

echo "🚀 Setting up Onyx development environment in GitHub Codespaces..."

# Update package list
sudo apt-get update

# Install essential development tools
sudo apt-get install -y \
    git \
    curl \
    wget \
    unzip \
    build-essential \
    python3-pip \
    python3-venv \
    nodejs \
    npm \
    docker.io \
    docker-compose \
    postgresql-client \
    redis-tools

# Install Python dependencies
pip3 install --upgrade pip
pip3 install \
    black \
    flake8 \
    isort \
    mypy \
    pytest \
    pytest-cov \
    pre-commit

# Install Node.js dependencies globally
npm install -g \
    @types/node \
    typescript \
    prettier \
    eslint \
    @typescript-eslint/parser \
    @typescript-eslint/eslint-plugin

# Create a .env file for Codespaces if it doesn't exist
if [ ! -f /workspaces/onyx-cutom/deployment/docker_compose/.env ]; then
    echo "📝 Creating .env file for Codespaces..."
    cat > /workspaces/onyx-cutom/deployment/docker_compose/.env << EOF
# Codespaces Environment Configuration
WEB_DOMAIN=http://localhost:8088
WEB_DOMAIN_NO_PROTOCOL=localhost:8088

# Database Configuration
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=onyx_db
POSTGRES_HOST=dev-db

# Redis Configuration
REDIS_HOST=dev-redis

# Vespa Configuration
VESPA_HOST=dev-vespa

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
fi

# Set up pre-commit hooks
cd /workspaces/onyx-cutom
if [ -f .pre-commit-config.yaml ]; then
    echo "🔧 Setting up pre-commit hooks..."
    pre-commit install
fi

# Create a startup script for easy development
cat > /workspaces/onyx-cutom/start-dev.sh << 'EOF'
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

chmod +x /workspaces/onyx-cutom/start-dev.sh

# Create a stop script
cat > /workspaces/onyx-cutom/stop-dev.sh << 'EOF'
#!/bin/bash
echo "🛑 Stopping Onyx development environment..."

cd deployment/docker_compose
docker-compose -f docker-compose.yml -f docker-compose.dev.yml down

echo "✅ Development environment stopped!"
EOF

chmod +x /workspaces/onyx-cutom/stop-dev.sh

# Create a logs script
cat > /workspaces/onyx-cutom/logs-dev.sh << 'EOF'
#!/bin/bash
echo "📋 Showing Onyx development logs..."

cd deployment/docker_compose
docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs -f
EOF

chmod +x /workspaces/onyx-cutom/logs-dev.sh

# Create a script to switch to minimal features (if needed)
cat > /workspaces/onyx-cutom/enable-minimal-features.sh << 'EOF'
#!/bin/bash
echo "🔧 Switching to minimal features for faster development..."

ENV_FILE="/workspaces/onyx-cutom/deployment/docker_compose/.env"
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

chmod +x /workspaces/onyx-cutom/enable-minimal-features.sh

echo "✅ Onyx development environment setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Configure your API keys in deployment/docker_compose/.env:"
echo "   - OPENAI_API_KEY=your_openai_key"
echo "   - COHERE_API_KEY=your_cohere_key"
echo "   - OAUTH_CLIENT_ID=your_oauth_client_id (if using OAuth)"
echo "2. Run './start-dev.sh' to start the development environment"
echo "3. Access the application at http://localhost:8088"
echo "4. Use './stop-dev.sh' to stop services"
echo "5. Use './logs-dev.sh' to view logs"
echo ""
echo "🔧 Available commands:"
echo "  ./start-dev.sh              - Start development environment"
echo "  ./stop-dev.sh               - Stop development environment"
echo "  ./logs-dev.sh               - View logs"
echo "  ./enable-minimal-features.sh - Disable auth/AI for faster development"
echo ""
echo "🌐 The application will be available at:"
echo "  - Web Interface: http://localhost:8088"
echo "  - API Server: http://localhost:8080" 