FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

COPY .env .env

EXPOSE 11000

CMD ["node", "app.new.js"]