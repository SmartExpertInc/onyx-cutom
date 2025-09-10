# custom_extensions/frontend/Dockerfile
FROM node:18-slim AS base

WORKDIR /app

# This will copy package.json from custom_extensions/frontend/package.json
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./

RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# This will copy all files from custom_extensions/frontend to /app
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

ARG NEXT_PUBLIC_API_BASE_URL_ARG
ENV NEXT_PUBLIC_CUSTOM_BACKEND_URL=${NEXT_PUBLIC_API_BASE_URL_ARG}

RUN npm run build

RUN npm prune --production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

USER nextjs

EXPOSE 3001
ENV PORT 3001
ENV NODE_ENV production

ENV NEXT_PUBLIC_MIXPANEL_TOKEN="e453fcc90175f12baa470ddc2b7d20c5"

CMD ["npm", "start", "--", "-p", "3001"]
