FROM node:18.13.0-alpine as builder
WORKDIR /api

COPY package.json .

RUN npm i --legacy-peer-deps

COPY . .

RUN npm run build

#ADD dist /api/dist
#ADD node_modules /api/dist/node_modules

#RUN apk add mongodb-tools

# Uncomment to init (seed) mongo database
#RUN npm run init

#WORKDIR /api/dist

FROM node:18.13.0-alpine

EXPOSE 3000/tcp
EXPOSE 3010/tcp
ENV NODE_ENV production

WORKDIR /api

COPY package*.json nodemon.json ./
RUN npm i --omit=dev --force
COPY --from=builder /api/dist ./src
COPY ./ssl/cert.crt ./ssl/cert.key /etc/ssl/certs/

# Make sure docker compose contains the "restart: always" property to automatically reboot the container on failure
CMD ["npx", "nodemon", "--config", "nodemon.json", "--exitcrash", "./src/index.js"]

LABEL MAINTAINER jclemente@prodevelop.es