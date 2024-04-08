FROM node:20-bookworm-slim

WORKDIR /code

COPY package*.json ./
RUN npm install --omit=dev
RUN npm install -g pm2

COPY . .

CMD ["pm2-runtime", "index.js"]
