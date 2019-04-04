FROM node:8.12.0-alpine
ENV TZ=Europe/Moscow
WORKDIR /app/
RUN  apk add --no-cache --virtual .build-deps binutils-gold curl g++ gcc gnupg libgcc linux-headers make python tzdata git
RUN  cp /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
RUN  npm i -g nodemon node-gyp
COPY package.json .
ARG ACCESS_TOKEN
RUN sed -i "s/ACCESS_TOKEN/$ACCESS_TOKEN/g" package.json
RUN  npm install
COPY nodemon.json .
COPY . .
EXPOSE 80
ENTRYPOINT ["node", "/app/node_modules/altha/src/core/altha.js", "start"]