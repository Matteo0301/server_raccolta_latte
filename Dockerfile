FROM node:lts-alpine
ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY ["package.json", "./"]
COPY . .
EXPOSE 443
RUN chown -R node /usr/src/app
USER node
RUN yarn install
RUN yarn build
CMD ["yarn", "start"]

