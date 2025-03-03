# syntax=docker/dockerfile:1

# Comments are provided throughout this file to help you get started.
# If you need more help, visit the Dockerfile reference guide at
# https://docs.docker.com/go/dockerfile-reference/

# Want to help us make this template better? Share your feedback here: https://forms.gle/ybq9Krt8jtBL3iCk7

ARG NODE_VERSION=23.6.1

FROM node:${NODE_VERSION}-alpine

# Use development node environment for running the dev server
ENV NODE_ENV development

# Set working directory first
WORKDIR /usr/src/app

# Download dependencies as a separate step to take advantage of Docker's caching
# Leverage a cache mount to /root/.npm to speed up subsequent builds
RUN --mount=type=cache,target=/root/.npm \
    npm install -g npm@latest

# Copy package files
COPY package*.json ./

# Install all dependencies including dev dependencies
RUN --mount=type=cache,target=/root/.npm \
    npm ci

# Copy the rest of the source files into the image
COPY . .

# Expose the port that the application listens on
EXPOSE 5173

# Run the application with host flag to allow external connections
CMD ["npm", "run", "dev", "--", "-H", "0.0.0.0"]
