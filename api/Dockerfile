FROM node:16-bullseye-slim
WORKDIR /app
COPY . .
EXPOSE 8080

RUN npm install
RUN mkdir -p recommender/data

RUN apt-get update
RUN apt-get install -y python3 python3-pip
RUN pip3 install -r recommender/requirements.txt

CMD ["node", "src/index.js"]