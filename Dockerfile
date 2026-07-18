# Stage 1: Build the Vue application using Node.js
FROM node:20-alpine AS build
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code and build the app
COPY . .
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Stage 2: Serve the application using Nginx
FROM nginx:alpine
# Copy the built static files
COPY --from=build /app/dist /usr/share/nginx/html
# Copy our custom Nginx config to replace the default one
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
