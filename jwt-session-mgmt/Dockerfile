FROM node:14.16-alpine

WORKDIR /app

RUN apk --no-cache add --virtual builds-deps build-base python

COPY ./package.json ./package-lock.json ./tsconfig.json ./
RUN npm install --no-cache

RUN mkdir ./src
# COPY ./src ./src

# RUN npm run-script build

# CMD ["node", "./build/src/server.js"]

COPY . .

CMD ["npm", "run-script", "start-dev"]