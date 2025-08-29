# custom_extensions/backend/Dockerfile
FROM python:3.9-slim

WORKDIR /app

# Install system dependencies for MoviePy, OpenCV, FFmpeg, and Pyppeteer/Chromium
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
    # FFmpeg and video processing dependencies
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
    # CRITICAL: System dependencies for MoviePy and OpenCV
    libsm6 \
    libxrender1 \
    libglib2.0-0 \
    libgomp1 \
    libgthread-2.0-0 \
    libgtk-3-dev \
    pkg-config \
    # CRITICAL: Additional MoviePy system dependencies
    imagemagick \
    ghostscript \
    # Clean up
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better Docker layer caching
COPY requirements.txt .

# Install Python dependencies with explicit MoviePy installation
RUN pip install --no-cache-dir --upgrade pip setuptools wheel && \
    pip install --no-cache-dir numpy==1.24.3 && \
    pip install --no-cache-dir opencv-python==4.8.0.76 && \
    pip install --no-cache-dir moviepy==1.0.3 && \
    pip install --no-cache-dir -r requirements.txt

# Verify MoviePy installation
RUN python -c "import moviepy.editor; print('MoviePy installed successfully')"

# Install Playwright browsers
RUN playwright install chromium

COPY . .

RUN mkdir -p /app/data /tmp/generated_pdfs /app/temp
RUN chmod -R 777 /tmp/generated_pdfs /app/temp

EXPOSE 8001
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]