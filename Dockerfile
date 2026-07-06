# Image 1 built the static webpage
FROM node:24-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Image 2 nginx overlay
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/crud-market/dist
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80 443 

# nginx -g daemin off, which change nginx to foreground process
CMD ["nginx", "-g", "daemon off;"]