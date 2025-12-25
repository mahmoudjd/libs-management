# syntax = docker/dockerfile:1

ARG NODE_VERSION=23.11.0
FROM node:${NODE_VERSION}-slim AS base

WORKDIR /app

ENV NODE_ENV="production"

FROM base AS build

RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential node-gyp pkg-config python-is-python3

# Nur package.json kopieren (ohne package-lock.json)
COPY package.json ./

RUN npm install --include=dev

COPY . .

# Falls du ein Build-Script hast
RUN npm run build

RUN npm prune --omit=dev

FROM base

COPY --from=build /app /app

EXPOSE 3000

CMD ["npm", "run", "start"]
