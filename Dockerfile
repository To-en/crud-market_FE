# Image 1 built the static webpage
FROM node:24-alpine AS build

# /app/<What we will install>
WORKDIR /app

# Copy package.json -> install , copy host source code to container workspace
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Image 2 nginx , start from scratch ,
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/crud-market/dist
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80 443 

# After finish building execute CMD: nginx -g daemin off, which change nginx from background off terminal
# To come as foreground process , and bind to specific terminal session (Use in VPS setting)
CMD ["nginx", "-g", "daemon off;"]