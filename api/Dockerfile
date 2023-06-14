FROM node:16-alpine
WORKDIR /app
COPY . .
EXPOSE 8080
RUN npm install
RUN mkdir data
CMD ["node", "src/index.js"]