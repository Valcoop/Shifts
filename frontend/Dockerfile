#Dev
FROM node:14-alpine as dev-stage
WORKDIR /app
COPY package*.json ./
RUN yarn global add @quasar/cli
COPY . .

#Build
FROM dev-stage as build-stage
RUN yarn
RUN quasar build

#Prod
FROM nginx:latest as prod-stage
COPY --from=build-stage /app/dist/spa /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
