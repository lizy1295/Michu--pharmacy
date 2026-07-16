FROM node:22-alpine

WORKDIR /app/backend

COPY backend/package.json ./
COPY backend/package-lock.json ./
COPY shared/package.json ../shared/

RUN npm install

COPY backend ./
COPY shared ../shared/

RUN npm run build

EXPOSE 3001

CMD ["npm", "run", "start:dev"]
