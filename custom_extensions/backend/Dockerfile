# custom_extensions/backend/Dockerfile
FROM python:3.9-slim

WORKDIR /app

# ============================================
# PART 1: Install System Dependencies
# ============================================
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    fonts-liberation \
    fonts-noto-color-emoji \
    fonts-symbola \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libgcc1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    lsb-release \
    wget \
    xdg-utils \
    chromium \
    fonts-inter \
    curl \
    gnupg2 \
    libffi-dev \
    libxml2-dev \
    libxslt-dev \
    ffmpeg \
    libx264-dev \
    libx265-dev \
    libvpx-dev \
    libaom-dev \
    libmp3lame-dev \
    libopus-dev \
    libvorbis-dev \
    libass-dev \
    libfreetype6-dev \
    libfontconfig1-dev \
    libsm6 \
    libxrender1 \
    libgomp1 \
    libgthread-2.0-0 \
    libgtk-3-dev \
    pkg-config \
    imagemagick \
    ghostscript \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# ============================================
# PART 2: Install Node.js 18.x
# ============================================
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Verify Node.js
RUN node --version && npm --version

# ============================================
# PART 3: Install Python Dependencies
# ============================================
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip setuptools wheel && \
    pip install --no-cache-dir numpy==1.24.3 && \
    pip install --no-cache-dir opencv-python==4.8.0.76 && \
    pip install --no-cache-dir moviepy==1.0.3 && \
    pip install --no-cache-dir -r requirements.txt

RUN python -c "import moviepy.editor; print('MoviePy installed successfully')"
RUN playwright install chromium
RUN python -m playwright install chromium

# ============================================
# PART 4: Copy Application Code First
# ============================================
COPY . .

# ============================================
# PART 5: Install Remotion AFTER copying code (to avoid overwrite)
# ============================================
WORKDIR /app/video_compositions
RUN npm install && \
    chmod -R 755 node_modules && \
    npx remotion versions && \
    echo "✅ Remotion installed successfully in Docker container"

WORKDIR /app

# ============================================
# PART 6: Create Directories
# ============================================
RUN mkdir -p /app/data /tmp/generated_pdfs /app/temp /app/output/presentations
RUN chmod -R 777 /tmp/generated_pdfs /app/temp /app/output

# ============================================
# PART 7: Start Application
# ============================================
EXPOSE 8001
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]