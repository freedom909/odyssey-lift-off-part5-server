FROM node:17-slim

WORKDIR  /starter
ENV NODE_ENV development

COPY package.json /starter/package.json

RUN npm install pm2 -g
RUN npm install --production

COPY .ENV
COPY ./starter 

CMD [ "pm2-runtime","app.json" ]
EXPOSE 8080