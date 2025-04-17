# Use an official Node.js runtime as a parent image
FROM node:23-alpine AS base

# Set the working directory
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
# Use --frozen-lockfile for deterministic installs
RUN npm ci --frozen-lockfile

# Install Prisma CLI globally in the image (needed for generate)
RUN npm install -g prisma

# Copy prisma schema and generate client
COPY prisma ./prisma/
RUN prisma generate

# Copy the rest of the application code
COPY . .

# Build the Next.js application
RUN npm run build

# Production image
FROM node:23-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=base /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=base --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=base --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=base --chown=nextjs:nodejs /app/prisma ./prisma/
# Copy generated prisma client (if needed at runtime, adjust if generation is part of startup)
# COPY --from=base /app/node_modules/.prisma ./node_modules/.prisma

USER nextjs

# Expose port 3002
EXPOSE 3000

# Server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD ["node", "server.js"]
