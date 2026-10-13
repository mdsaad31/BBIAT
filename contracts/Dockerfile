FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx hardhat compile
CMD ["sh", "-c", "npx hardhat run scripts/deploy.js --network localhost && cp -r /app/../../shared /app/shared 2>/dev/null; echo 'Contract deployed'"]
