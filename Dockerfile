FROM node:10.16.0-alpine
WORKDIR /api


ADD . /api

RUN npm i

RUN npm run build

#ADD dist /api/dist
#ADD node_modules /api/dist/node_modules

#RUN apk add mongodb-tools

# Uncomment to init (seed) mongo database
#RUN npm run init

#WORKDIR /api/dist
EXPOSE 3000/tcp
ENV NODE_ENV production

CMD ["npm", "run", "start"]

LABEL MAINTAINER jclemente@prodevelop.es