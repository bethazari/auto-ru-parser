FROM node:8.12.0-alpine
WORKDIR /app/
RUN apk -U add --no-cache --virtual .build-deps binutils-gold curl g++ gcc gnupg libgcc linux-headers make python git alpine-sdk autoconf make libtool nasm zlib-dev automake
RUN npm i -g next nodemon
COPY package.json .
COPY package-lock.json .
ARG ACCESS_TOKEN
RUN sed -i "s/ACCESS_TOKEN/$ACCESS_TOKEN/g" package.json
RUN npm install
COPY . .
RUN npm run build
EXPOSE 80
ENTRYPOINT ["node", "/app/node_modules/altha/src/core/altha.js", "start"]