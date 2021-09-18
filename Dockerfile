
FROM node:alpine

# Add timezone package to docker image
RUN apk update && apk add -U tzdata && \
    cp /usr/share/zoneinfo/Asia/Kolkata /etc/localtime

RUN mkdir /opt/nestjs-with-microservices

# Copy package.json first to cache changes
WORKDIR /opt
COPY package.json package-lock.json* ./
RUN npm install && npm cache clean --force
ENV PATH /opt/node_modules/.bin:$PATH

WORKDIR /opt/nestjs-with-microservices
COPY . .

# default to port 80 for node, and 9229 and 9231 (tests) for debug
ARG PORT=3000
ENV PORT $PORT

# set our node environment, either development or production
# defaults to production, compose overrides this to development on build and run
ARG NODE_ENV=development
ENV NODE_ENV $NODE_ENV

EXPOSE $PORT 9231

# HEALTHCHECK --interval=30s CMD ts-node healthcheck.ts
CMD [ "/bin/sh", "-c", " crond && node -r tsconfig-paths/register --require ts-node/register src/main.ts" ]

