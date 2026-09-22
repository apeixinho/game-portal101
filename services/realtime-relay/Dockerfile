# Reusable realtime relay foundation for future online modes.
# Stateless ws fan-out + REST polling fallback; safe to restart/redeploy (Render).
FROM node:20-alpine AS build
WORKDIR /app
RUN corepack enable
COPY package.json ./
RUN npm install --no-package-lock
COPY tsconfig.json ./
COPY src ./src
RUN npx tsc -p tsconfig.json

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json ./
RUN npm install --omit=dev --no-package-lock
COPY --from=build /app/dist ./dist
EXPOSE 8787
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:8787/healthz || exit 1
CMD ["node", "dist/index.js"]
