FROM node:alpine as builder
WORKDIR /app
COPY package.json .
RUN npm install
COPY . . 
RUN npm run build
RUN rm -rf ./node_modules

FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html

