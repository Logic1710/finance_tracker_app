# Use the official Node.js image.
# https://hub.docker.com/_/node
FROM node:latest

# Create and change to the app directory.
WORKDIR /usr/src/app

# Copy application dependency manifests to the container image.
COPY package*.json ./

# Install production dependencies.
RUN npm install --only=production

# Copy local code to the container image.
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Run the web service on container startup.
CMD [ "npm", "start" ]

# Inform Docker that the container listens on the specified port.
EXPOSE 8080