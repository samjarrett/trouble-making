FROM node:16-alpine

WORKDIR /cwd

COPY package.json package-lock.json /cwd/
RUN set -xe && \
    npm ci && \
    true

ENV PATH=$PATH:/cwd/node_modules/.bin
ENV CDK_NEW_BOOTSTRAP=1
