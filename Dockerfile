# ── Stage 1: Install dependencies & build Next.js ──
FROM node:18-slim AS builder

WORKDIR /app

# Install Python + system libs needed by OpenCV / Pillow
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 python3-pip python3-venv \
    libgl1 libglib2.0-0 libjpeg62-turbo libpng16-16 \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies (CPU-only PyTorch to save ~1.5 GB)
COPY backend/requirements.txt /tmp/requirements.txt
RUN pip3 install --no-cache-dir --break-system-packages \
    torch --index-url https://download.pytorch.org/whl/cpu && \
    pip3 install --no-cache-dir --break-system-packages -r /tmp/requirements.txt

# Install Node dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# ── Stage 2: Production image ──
FROM node:18-slim AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=10000

# Install Python + runtime libs (no build tools needed)
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 python3-pip \
    libgl1 libglib2.0-0 libjpeg62-turbo libpng16-16 \
    && rm -rf /var/lib/apt/lists/*

# Copy Python packages from builder
COPY --from=builder /usr/local/lib/python3.11/dist-packages /usr/local/lib/python3.11/dist-packages
COPY --from=builder /usr/lib/python3/dist-packages /usr/lib/python3/dist-packages

# Copy built Next.js app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Copy backend scripts
COPY --from=builder /app/backend ./backend

EXPOSE 10000

CMD ["node", "server.js"]
