# Image to build from
FROM node:10

# Create app directory
WORKDIR /usr/src/app

# Copy package.json
COPY package*.json ./

# Install all dependencies
RUN npm install

# removed source code from image

# Map port to the Docker daemon
EXPOSE 5000

# Run the start script
CMD [ "npm", "dev" ]
