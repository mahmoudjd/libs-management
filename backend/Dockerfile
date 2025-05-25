# syntax = docker/dockerfile:1

# Stage 1: Base Image
ARG NODE_VERSION=23.11.0
FROM node:${NODE_VERSION}-slim AS base

LABEL fly_launch_runtime="Node.js"
WORKDIR /app
ENV NODE_ENV="production"

# Stage 2: Build
FROM base AS build

RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential node-gyp pkg-config python-is-python3

COPY package*.json ./
RUN npm ci --include=dev

COPY . .
RUN npm run build

RUN npm prune --omit=dev

# Stage 3: Final Image
FROM base
COPY --from=build /app /app

EXPOSE 8080
CMD [ "npm", "run", "start" ]
