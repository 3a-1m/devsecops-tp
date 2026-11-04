FROM node:22.21.1-alpine3.22 AS dependencies

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

FROM node:22.21.1-alpine3.22 AS runtime

ENV NODE_ENV=production
WORKDIR /app
COPY --chown=node:node --from=dependencies /app/node_modules ./node_modules
COPY --chown=node:node package.json ./
COPY --chown=node:node src/ ./src/

USER node
EXPOSE 3000
CMD ["node", "src/index.js"]
