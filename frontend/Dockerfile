FROM ubuntu:18.04

RUN apt update && apt install -y wget nodejs npm
RUN npm install -g n && n stable

RUN mkdir app
WORKDIR /app

COPY ./auth-form/package.json /app/package.json
COPY ./auth-form/package-lock.json /app/package-lock.json
RUN CI=true
RUN npm install

COPY ./auth-form /app
