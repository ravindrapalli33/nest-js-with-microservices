# Development

FROM node:16.9.0-alpine3.11 AS development

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install -g rimraf

RUN npm install --only=development

COPY . .

RUN npm run build


# Production

FROM node:16.9.0-alpine3.11 AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --only=production

COPY . .

COPY --from=development /usr/src/app/dist ./dist

CMD ["node", "dist/main"]
