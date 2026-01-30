FROM node:20-alpine AS builder

WORKDIR /app

COPY . .
RUN npm i

CMD ["npm", "run", "db:mgrate:seed"]
