# custom_extensions/backend/Dockerfile
FROM python:3.9-slim

WORKDIR /app

# Install system dependencies for Pyppeteer/Chromium and HTML-to-image libraries
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
    # HTML-to-image system dependencies
    wkhtmltopdf \
    libgdk-pixbuf2.0-0 \
    libffi-dev \
    libxml2-dev \
    libxslt-dev \
    # Clean up
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install Playwright browser for html2image/playwright support
RUN playwright install chromium --with-deps

COPY . .

RUN mkdir -p /app/data /tmp/generated_pdfs
RUN chmod -R 777 /tmp/generated_pdfs # Ensure /tmp is writable

EXPOSE 8001
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]
