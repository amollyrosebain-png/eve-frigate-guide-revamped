# Self-hosted build of the EVE Frigate Guide (Node server, port 3000).
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json bun.lock* package-lock.json* ./
RUN npm install --no-audit --no-fund
COPY . .
# Target a plain Node server instead of Cloudflare Workers.
ENV NITRO_PRESET=node-server
RUN npx vite build
# Ship images are served from /__l5e/... on Lovable hosting; bundle local copies.
RUN cp -r docker/static/. .output/public/

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production PORT=3000 HOST=0.0.0.0
COPY --from=build /app/.output ./.output
EXPOSE 3000
USER node
HEALTHCHECK --interval=30s --timeout=5s CMD wget -qO- http://127.0.0.1:3000/ >/dev/null || exit 1
CMD ["node", ".output/server/index.mjs"]
